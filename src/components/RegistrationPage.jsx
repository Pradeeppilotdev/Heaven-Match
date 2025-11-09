import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import * as XLSX from "xlsx";
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// Constants
const INITIAL_UPLOAD_FORM = {
  email: '', phone: '', fileName: '', profileLink: '', aadhaar: '', profilePictureName: ''
}
const INITIAL_MANUAL_FORM = {
  firstName: '', lastName: '', dob: '', age: '', gender: '', maritalStatus: '', email: '', phone: '',
  Education: '', profession: '', Income: '', Location: '', religion: '', community: '', caste: '',
  motherTongue: '', familyType: '', siblings: '', heightCm: '', weightKg: '', about: '',
  partnerPreferences: '', hobbies: '', aadhaar: '', profilePictureName: ''
}
const INITIAL_OTP_STATE = {
  otpSent: false, otpVerified: false, attempts: 0, otpInput: '',
  generatedOtp: null, timer: 0, error: null
}

// Validation helpers
const isBlank = s => !s || String(s).trim().length === 0
const looksLikeGmail = s => /^[^\s@]+@gmail\.com$/i.test(String(s || '').trim())
const looksLikePhone = s => {
  const raw = String(s || '').replace(/[\s\-()]/g, '')
  return /^(\+91|91|0)?[6-9][0-9]{9}$/.test(raw)
}
const looksLikeAadhaar = s => /^[0-9]{12}$/.test(String(s || '').trim())
const maskAadhaar = (aadhaar) => {
  if (!aadhaar) return '';
  const trimmed = String(aadhaar).trim();
  if (trimmed.length <= 4) return trimmed;
  return '********' + trimmed.slice(-4);
};

const sanitizeText = (text = '') => {
  if (!text) return '';
  let clean = text.replace(/<[^>]*>?/gm, '');
  clean = clean.replace(/[<>"'`=\/\\(){}\[\]:;&%^*#]/g, '');
  return clean;
};

// ProfilePictureBox
const ProfilePictureBox = React.memo(({ 
  profilePicFile,
  profilePicPreview,
  error, 
  onFileChange,
  onRemove,
  inputRef
}) => (
  <div className="profile-box">
    <div className="profile-box-inner">
      <label className="profile-box-label">Upload Profile Picture * (&lt; 2 MB)
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="profile-box-input"
        />
      </label>

      {profilePicFile && profilePicFile.name ? (
        <div className="profile-box-file">
          <span className="file-name" title={profilePicFile.name}>
            {profilePicFile.name}
          </span>

          {onRemove && (
            <button
              type="button"
              className="btn-remove-small"
              onClick={() => {
                onRemove()
                if (inputRef && inputRef.current) {
                  try { inputRef.current.value = '' } catch(e) {}
                }
              }}
            >
              Remove
            </button>
          )}
        </div>
      ) : null}
    </div>

    {profilePicPreview && (
      <div className="profile-preview-box">
        <img src={profilePicPreview} alt="Profile preview" className="profile-preview-img" />
      </div>
    )}

    {error && <div className="profile-box-error">{error}</div>}
  </div>
))

// OTPVerification
const OTPVerification = React.memo(({ 
  email, 
  otpState, 
  onSendOtp, 
  onVerifyOtp, 
  onResendOtp, 
  onOtpInputChange 
}) => {
  if (otpState.otpVerified) {
    return (
      <div className="otp-row">
        <div className="otp-verified-inline">
          <small className="success">Verified OTP ✓</small>
        </div>
      </div>
    )
  }

  return (
    <div className="otp-row">
      {!otpState.otpSent ? (
        <button type="button" onClick={onSendOtp}>Send OTP to {email}</button>
      ) : (
        <div className="otp-entry">
          <input
            placeholder="Enter OTP"
            value={otpState.otpInput}
            onChange={(e) => onOtpInputChange(e.target.value)}
          />
          <button type="button" onClick={onVerifyOtp}>Verify OTP</button>
          <div>
            {otpState.error && <small className="err">{otpState.error}</small>}
            {otpState.timer > 0 ? (
              <small>Expires in {Math.floor(otpState.timer/60)}:{String(otpState.timer%60).padStart(2,'0')}</small>
            ) : (
              <small>OTP expired. <button type="button" onClick={onResendOtp}>Resend</button></small>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

// EmailField
const EmailField = React.memo(({ 
  email, 
  emailIsGmail, 
  otpState, 
  errors, 
  onChange, 
  onSendOtp, 
  onVerifyOtp, 
  onOtpInputChange 
}) => (
  <>
    <label>Email *
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <input name="email" value={email} onChange={onChange} />
        <button
          type="button"
          className="email-verify-btn"
          onClick={onSendOtp}
          disabled={!emailIsGmail || otpState.otpSent || otpState.otpVerified}
          title={!emailIsGmail ? 'Enter a gmail address to verify' : 'Send OTP'}
        >
          {otpState.otpVerified ? 'Verified' : (otpState.otpSent ? 'Sent' : 'Verify')}
        </button>
      </div>
      {errors.email && <small className="err">{errors.email}</small>}
    </label>

    {emailIsGmail && (otpState.otpSent || otpState.otpVerified) && (
      <OTPVerification
        email={email}
        otpState={otpState}
        onSendOtp={onSendOtp}
        onVerifyOtp={onVerifyOtp}
        onResendOtp={onSendOtp}
        onOtpInputChange={onOtpInputChange}
      />
    )}
  </>
))

export default function RegistrationPage() {
  const [mode, setMode] = useState('upload')
  const [showPopup, setShowPopup] = useState(false)
  const [uploadForm, setUploadForm] = useState(INITIAL_UPLOAD_FORM)
  const [manualForm, setManualForm] = useState(INITIAL_MANUAL_FORM)
  const [file, setFile] = useState(null)
  const [profilePicFile, setProfilePicFile] = useState(null)
  const [profilePicPreview, setProfilePicPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [showSwitchWarning, setShowSwitchWarning] = useState(false)
  const [pendingMode, setPendingMode] = useState(null)
  const [otpState, setOtpState] = useState(INITIAL_OTP_STATE)
  const [maskedAadhaar, setMaskedAadhaar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [extractedProfile, setExtractedProfile] = useState(null)
  const navigate = useNavigate()

  const timerRef = useRef(null)
  const profilePicInputRef = useRef(null)
  const uploadFileInputRef = useRef(null)


  // --- ExtractedProfileDetails: shows all extracted fields for review ---
const ExtractedProfileDetails = ({ ep = {}, onDiscard, onEdit }) => {
  if (!ep) return null;
  const rows = [
    ['Full name', ep.fullName],
    ['First name', ep.firstName],
    ['Last name', ep.lastName],
    ['Date of birth', ep.dateOfBirth],
    ['Age', ep.age],
    ['Gender', ep.gender],
    ['Marital status', ep.maritalStatus],
    ['Email', ep.email],
    ['Phone', ep.phone],
    ['Aadhaar', maskAadhaar(ep.aadhaar || '')],
    ['Education', ep.education],
    ['Profession', ep.occupation || ep.profession],
    ['Income', ep.income],
    ['Location', ep.location],
    ['Religion', ep.religion],
    ['Community', ep.community],
    ['Caste', ep.caste],
    ['Mother tongue', ep.motherTongue],
    ['Family type', ep.familyType],
    ['No. of siblings', ep.noOfSiblings],
    ['Height (raw)', ep.height],
    ['Weight (raw)', ep.weight],
    ['Hobbies', ep.hobbies],
    ['About me', ep.aboutMe],
    ['Partner preferences', ep.partnerPreferences]
  ];

  return (
    <div style={{
      marginTop: 12,
      border: '1px solid #f3c6d6',
      padding: 12,
      borderRadius: 10,
      background: '#fff7fb'
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <strong style={{ color:'#b91c73' }}>AI-extracted profile (full preview)</strong>
        <div style={{ fontSize:12, color:'#6b7280' }}>Review & edit before Register</div>
      </div>

      <div style={{ maxHeight: 300, overflow: 'auto', padding: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ borderRadius:6, background:'#fff', padding:8, minHeight:36 }}>
            <small className="label" style={{ color:'#6b7280' }}>{label}</small>
            <div style={{ marginTop:6 }}>{value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, marginTop:10, justifyContent:'flex-end' }}>
        <button type="button" onClick={onDiscard} style={{ padding:'8px 12px', background:'#e5e7eb', borderRadius:6, border:'none', cursor:'pointer' }}>Discard</button>
        <button type="button" onClick={onEdit} style={{ padding:'8px 12px', background:'#db2777', color:'white', borderRadius:6, border:'none', cursor:'pointer' }}>Open in Manual (Edit)</button>
      </div>
    </div>
  );
};


  // --- Handlers for AI-extracted profile ---
  const openManualFromExtracted = useCallback(() => {
    if (!extractedProfile) return;

    setManualForm(prev => ({
      ...prev,
      firstName: prev.firstName || (extractedProfile.fullName ? extractedProfile.fullName.split(' ')[0] : ''),
      lastName: prev.lastName || (extractedProfile.fullName ? extractedProfile.fullName.split(' ').slice(1).join(' ') : ''),
      dob: prev.dob || (extractedProfile.dateOfBirth ? convertDateFormat(extractedProfile.dateOfBirth) : ''),
      age: prev.age || (extractedProfile.dateOfBirth ? String(calcAgeFromDob(convertDateFormat(extractedProfile.dateOfBirth))) : ''),
      gender: prev.gender || extractedProfile.gender || '',
      Education: prev.Education || extractedProfile.education || '',
      profession: prev.profession || extractedProfile.occupation || '',
      Income: prev.Income || extractedProfile.income || '',
      Location: prev.Location || extractedProfile.location || '',
      religion: prev.religion || extractedProfile.religion || '',
      caste: prev.caste || extractedProfile.caste || '',
      motherTongue: prev.motherTongue || extractedProfile.motherTongue || '',
      heightCm: prev.heightCm || (extractedProfile.height ? extractHeightInCm(extractedProfile.height) : ''),
      about: prev.about || extractedProfile.aboutMe || ''
    }));

    setMode('manual');
    setExtractedProfile(null);
  }, [extractedProfile]);

  const discardExtractedProfile = useCallback(() => {
    setExtractedProfile(null);
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.upload;
      return copy;
    });
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
  try {
    const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
    if (!userToken) {
      return
    }

    const response = await fetch(`https://cliff-unseductive-mariam.ngrok-free.dev/api/signup`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      
      // Check if user is already registered
      if (data.isRegistered || data.profile_completed) {
        setErrors({ general: 'Profile already registered. Redirecting to home...' })
        setTimeout(() => {
          navigate('/home')
        }, 2000)
        return
      }
      
      const dobFormatted = data.dob ? convertDateFormat(data.dob) : ''
      const age = dobFormatted ? calcAgeFromDob(dobFormatted) : ''
      
      setUploadForm(prev => ({
        ...prev,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
      }))
      
      setManualForm(prev => ({
        ...prev,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        dob: dobFormatted || prev.dob,
        age: age || prev.age
      }))
    }
  } catch (error) {
    // Silent error handling
  }
}

    fetchUserData()
  }, [])

  // age helpers, DOB limits
  const calcAgeFromDob = (dobStr) => {
    if (!dobStr) return null
    const dob = new Date(dobStr)
    const now = new Date()
    let age = now.getFullYear() - dob.getFullYear()
    const m = now.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--
    return age
  }

  const today = new Date()
  const maxDobDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  const minDobDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
  const formatIsoDate = d => d.toISOString().slice(0,10)
  const DOB_MAX = formatIsoDate(maxDobDate)
  const DOB_MIN = formatIsoDate(minDobDate)

  const handleDobChange = useCallback((e) => {
    const dobValue = e.target.value
    const ageNum = calcAgeFromDob(dobValue)
    if (ageNum !== null && ageNum < 18) {
      setErrors(prev => ({ ...prev, age: 'You must be at least 18 years old' }))
      return
    }
    if (ageNum !== null && ageNum > 50) {
      const ok = window.confirm('You are older than 50. Are you sure you want to continue?')
      if (!ok) {
        if (mode === 'upload') setUploadForm(prev => ({ ...prev, dob: '', age: '' }))
        else setManualForm(prev => ({ ...prev, dob: '', age: '' }))
        return
      }
    }

    setErrors(prev => {
      const copy = { ...prev }
      delete copy.age
      return copy
    })

    if (mode === 'upload') {
      setUploadForm(prev => ({ ...prev, dob: dobValue, age: ageNum !== null ? String(ageNum) : '' }))
    } else {
      setManualForm(prev => ({ ...prev, dob: dobValue, age: ageNum !== null ? String(ageNum) : '' }))
    }
  }, [mode])

  const form = useMemo(() => 
    mode === 'upload' ? uploadForm : manualForm,
    [mode, uploadForm, manualForm]
  )

  const currentEmailRaw = useMemo(() => String(form.email || '').trim(), [form.email])
  const emailIsGmail = useMemo(() => looksLikeGmail(currentEmailRaw), [currentEmailRaw])

  // ✅ FIX: Convert blob to base64 data URL for CSP compliance
  useEffect(() => {
    if (!profilePicFile) {
      setProfilePicPreview(null)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicPreview(reader.result) // base64 data URL
    }
    reader.readAsDataURL(profilePicFile)
  }, [profilePicFile])

  // OTP countdown
  useEffect(() => {
    if (otpState.timer > 0) {
      timerRef.current = setInterval(() => {
        setOtpState(prev => {
          if (prev.timer <= 1) {
            clearInterval(timerRef.current)
            return { ...prev, timer: 0 }
          }
          return { ...prev, timer: prev.timer - 1 }
        })
      }, 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [otpState.timer])

  useEffect(() => {
    setOtpState(INITIAL_OTP_STATE)
  }, [form.email])

  const isFormFilled = useCallback(() => {
    if (mode === 'upload') {
      return !!(uploadForm.email || uploadForm.phone || uploadForm.profileLink || 
                uploadForm.aadhaar || file || profilePicFile)
    }
    return Object.keys(manualForm).some(key => {
      const value = manualForm[key]
      return key !== 'consentAadhaar' && value && String(value).trim().length > 0
    }) || !!profilePicFile
  }, [mode, uploadForm, manualForm, file, profilePicFile])

  const handleModeSwitch = useCallback((newMode) => {
    if (newMode === mode) return
    
    if (isFormFilled()) {
      setPendingMode(newMode)
      setShowSwitchWarning(true)
    } else {
      setMode(newMode)
      setErrors({})
    }
  }, [mode, isFormFilled])

  const resetAllForms = useCallback(() => {
    setUploadForm(INITIAL_UPLOAD_FORM)
    setManualForm(INITIAL_MANUAL_FORM)
    setFile(null)
    setProfilePicFile(null)
    setProfilePicPreview(null)
    setOtpState(INITIAL_OTP_STATE)
    setErrors({})
  }, [])

  const confirmModeSwitch = useCallback(() => {
    resetAllForms()
    setMode(pendingMode)
    setShowSwitchWarning(false)
    setPendingMode(null)
  }, [pendingMode, resetAllForms])

  const cancelModeSwitch = useCallback(() => {
    setShowSwitchWarning(false)
    setPendingMode(null)
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    const setterFn = mode === 'upload' ? setUploadForm : setManualForm
    setterFn(prev => ({ ...prev, [name]: val }))
  }, [mode])

  const handleDocumentUpload = useCallback(async (file) => {
    if (!file) return;

    try {
      setErrors(prev => ({ ...prev, upload: ' Extracting profile data...' }));

const accessToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')    
if (!accessToken) {
        throw new Error('Authentication required')
      }
      
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`${API_BASE}/api/extract-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}` 
        },
        body: formData
      });
      const result = await response.json();

      if (result.ok && result.data) {
        const profileData = result.data;

        setUploadForm(prev => ({
          ...prev,
          email: profileData.email || prev.email,
          phone: profileData.phone || prev.phone,
          aadhaar: profileData.aadhaar || prev.aadhaar || ''
        }));

        setExtractedProfile(profileData);
        setErrors(prev => { const c = { ...prev }; delete c.upload; return c; });
      } else {
        setErrors(prev => ({ ...prev, upload: result.message || 'Failed to extract profile data. Please fill manually.' }));
        setExtractedProfile(null);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, upload: 'Failed to extract profile data. Please fill manually.' }));
      setExtractedProfile(null);
    }
  }, [])

  const convertDateFormat = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return '';
  };

  const extractHeightInCm = (heightStr) => {
    if (!heightStr) return '';
    const numMatch = heightStr.match(/\d+/);
    return numMatch ? numMatch[0] : '';
  };

  const handleFile = useCallback(async (e) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setUploadForm(prev => ({ ...prev, fileName: f ? f.name : '' }))

    if (f) {
      await handleDocumentUpload(f)
    }
  }, [handleDocumentUpload])

  const handleProfilePic = useCallback((e) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;

    const MAX = 2 * 1024 * 1024;
    if (f.size > MAX) {
      setErrors(prev => ({ ...prev, profilePicture: 'Profile picture must be less than 2 MB' }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(f.type)) {
      setErrors(prev => ({ ...prev, profilePicture: 'Only JPG or PNG images are allowed' }));
      return;
    }

    setErrors(prev => {
      const copy = { ...prev };
      delete copy.profilePicture;
      return copy;
    });

    setProfilePicFile(f);

    const setterFn = mode === 'upload' ? setUploadForm : setManualForm;
    setterFn(prev => ({ ...prev, profilePictureName: f.name }));
  }, [mode]);

  const removeProfilePicture = useCallback(() => {
    setProfilePicFile(null)
    setProfilePicPreview(null)

    if (mode === 'upload') {
      setUploadForm(prev => ({ ...prev, profilePictureName: '' }))
    } else {
      setManualForm(prev => ({ ...prev, profilePictureName: '' }))
    }

    setErrors(prev => {
      const copy = { ...prev }
      delete copy.profilePicture
      return copy
    })

    if (profilePicInputRef && profilePicInputRef.current) {
      try { profilePicInputRef.current.value = '' } catch(e){ /* ignore */ }
    }
  }, [mode])

  const removeUploadedFile = useCallback(() => {
    setFile(null)
    setUploadForm(prev => ({ ...prev, fileName: '' }))

    if (uploadFileInputRef && uploadFileInputRef.current) {
      try { uploadFileInputRef.current.value = '' } catch(e){ /* ignore */ }
    }

    setErrors(prev => {
      const copy = { ...prev }
      delete copy.upload
      return copy
    })
  }, [])

  // OTP handlers
  const sendOtp = useCallback(async () => {
    const email = String(form.email || '').trim()
    if (!looksLikeGmail(email)) {
      setOtpState(prev => ({ ...prev, error: 'Enter a valid gmail address to send OTP' }))
      return
    }

    try {
      setOtpState(prev => ({ ...prev, error: null }))
      const resp = await fetch(`${API_BASE}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const body = await resp.json()
      if (!resp.ok) {
        setOtpState(prev => ({ ...prev, error: body?.message || 'Failed to send OTP' }))
        return
      }
      setOtpState(prev => ({
        ...prev,
        otpSent: true,
        otpVerified: false,
        otpInput: '',
        timer: 120,
        error: null
      }))
    } catch (err) {
      setOtpState(prev => ({ ...prev, error: 'Failed to send OTP' }))
    }
  }, [form.email])

  const verifyOtp = useCallback(async () => {
    const email = String(form.email || '').trim()
    if (!looksLikeGmail(email)) {
      setOtpState(prev => ({ ...prev, error: 'Enter a valid gmail address' }))
      return
    }

    try {
      const resp = await fetch(`${API_BASE}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpState.otpInput })
      })
      const body = await resp.json()
      if (!resp.ok) {
        setOtpState(prev => ({
          ...prev,
          error: body?.message || 'OTP verification failed',
          attempts: (prev.attempts || 0) + 1
        }))
        return
      }
      setOtpState(prev => ({
        ...prev,
        otpVerified: true,
        otpSent: false,
        error: null,
        otpInput: '',
        timer: 0
      }))
    } catch (err) {
      setOtpState(prev => ({ ...prev, error: 'OTP verify failed' }))
    }
  }, [form.email, otpState.otpInput])

  const handleOtpInputChange = useCallback((value) => {
    setOtpState(prev => ({ ...prev, otpInput: value, error: null }))
  }, [])

  const validateManualRequiredFields = useCallback((manualForm, errs) => {
    const reasons = []
    let requiredMissing = false

    if (isBlank(manualForm.firstName)) {
      errs.firstName = 'First name is required'
      requiredMissing = true
      reasons.push('firstName')
    }

    const ageRaw = String(manualForm.age || '').trim()
    const ageNum = Number(ageRaw)
    if (isBlank(manualForm.dob)) {
      errs.age = 'Date of birth is required'
      requiredMissing = true
      reasons.push('dob-empty')
    } else if (isBlank(ageRaw) || Number.isNaN(ageNum)) {
      errs.age = 'Age is required'
      requiredMissing = true
      reasons.push('age-empty-or-non-numeric')
    } else if (ageNum < 18 || ageNum > 50) {
      if (ageNum < 18) {
        errs.age = 'Age must be at least 18'
        requiredMissing = true
        reasons.push('age-below-18')
      } else {
        errs.age = undefined 
      }
    }

    if (isBlank(manualForm.gender)) {
      errs.gender = 'Gender is required'
      requiredMissing = true
      reasons.push('gender')
    }

    if (isBlank(manualForm.Education)) {
      errs.Education = 'Education is required'
      requiredMissing = true
      reasons.push('education')
    }

    const incomeVal = String(manualForm.Income || '').trim()
    if (isBlank(incomeVal)) {
      errs.Income = 'Income is required'
      requiredMissing = true
      reasons.push('income-empty')
    } else if (incomeVal && isNaN(Number(incomeVal))) {
      errs.Income = 'Enter a valid numeric income'
      requiredMissing = true
      reasons.push('income-format')
    }

    return { requiredMissing, reasons }
  }, [])

  const validateContactFields = useCallback((formData, errs, otpState) => {
    const reasons = []
    let requiredMissing = false

    const emailVal = String(formData.email || '').trim()
    if (isBlank(emailVal)) {
      errs.email = 'Email (Gmail) is required'
      requiredMissing = true
      reasons.push('email-empty')
    } else if (!looksLikeGmail(emailVal)) {
      errs.email = 'Email must be a Gmail address (example@gmail.com)'
      requiredMissing = true
      reasons.push('email-format-gmail')
    } else if (!otpState.otpVerified) {
      errs.email = 'Gmail OTP not verified'
      requiredMissing = true
      reasons.push('email-not-verified')
    }

    const phoneVal = String(formData.phone || '').trim()
    if (isBlank(phoneVal)) {
      errs.phone = 'Phone is required'
      requiredMissing = true
      reasons.push('phone-empty')
    } else if (!looksLikePhone(phoneVal)) {
      errs.phone = 'Enter a valid 10-digit phone number (or with +91 / 0 prefix)'
      requiredMissing = true
      reasons.push('phone-format')
    }

    if (isBlank(formData.aadhaar) || !looksLikeAadhaar(formData.aadhaar)) {
      errs.aadhaar = 'Enter a valid 12-digit Aadhaar number'
      requiredMissing = true
      reasons.push('aadhaar-invalid')
    }

    return { requiredMissing, reasons }
  }, [])

  const validateProfilePicture = useCallback((profilePicFile, errs) => {
    let requiredMissing = false

    if (!profilePicFile) {
      errs.profilePicture = 'Profile picture is required'
      requiredMissing = true
    } else {
      const MAX = 2 * 1024 * 1024
      if (profilePicFile.size > MAX) {
        errs.profilePicture = 'Profile picture must be less than 2 MB'
      } else if (!/^image\//.test(profilePicFile.type || '')) {
        errs.profilePicture = 'Only image files (jpeg/png) allowed'
      }
    }

    return requiredMissing
  }, [])

  const validate = useCallback(() => {
    const errs = {}

    if (mode === 'manual') {
      const { requiredMissing: reqMissing1, reasons: reasons1 } = validateManualRequiredFields(manualForm, errs)
      const { requiredMissing: reqMissing2, reasons: reasons2 } = validateContactFields(manualForm, errs, otpState)
      const reqMissing3 = validateProfilePicture(profilePicFile, errs)

      if (manualForm.heightCm && manualForm.heightCm.toString().trim().length) {
        const h = Number(String(manualForm.heightCm).trim())
        if (Number.isNaN(h)) {
          errs.heightCm = 'Enter a valid number for height (cm)'
        } else if (h < 100 || h > 250) {
          errs.heightCm = 'Height must be between 100 cm and 250 cm'
        }
      }

      if (manualForm.weightKg && manualForm.weightKg.toString().trim().length) {
        const w = Number(String(manualForm.weightKg).trim())
        if (Number.isNaN(w)) {
          errs.weightKg = 'Enter a valid number for weight (kg)'
        } else if (w < 30 || w > 200) {
          errs.weightKg = 'Weight must be between 30 kg and 200 kg'
        }
      }

      const requiredMissing = reqMissing1 || reqMissing2 || reqMissing3
      if (requiredMissing) {
        errs.general = true
        errs._debug = { reasons: [...reasons1, ...reasons2] }
      }

      return errs
    }

    if (!file && isBlank(uploadForm.profileLink)) {
      errs.upload = 'Please upload a file or paste a profile link'
    }
    if (!isBlank(uploadForm.profileLink) && !String(uploadForm.profileLink).trim().startsWith('http')) {
      errs.profileLink = 'Paste a valid link (starting with http)'
    }

    const { requiredMissing: reqMissing1, reasons: reasons1 } = validateContactFields(uploadForm, errs, otpState)
    const reqMissing2 = validateProfilePicture(profilePicFile, errs)

    const requiredUploadMissing = reqMissing1 || reqMissing2 || !!(errs.upload || errs.profileLink)
    if (requiredUploadMissing) {
      errs.general = true
      errs._debug = { requiredUploadMissing: true, reasons: reasons1 }
    }

    return errs
  }, [mode, uploadForm, manualForm, file, profilePicFile, otpState, validateManualRequiredFields, validateContactFields, validateProfilePicture])

  // Scroll to the first visible element with the .err class or the first invalid input
const scrollToFirstError = useCallback(() => {
  // try to find visible .err elements
  const errEl = Array.from(document.querySelectorAll('.err'))
    .find(el => el.offsetParent !== null); // visible

  if (errEl) {
    // If the error message is within a label block, scroll the label
    const candidate = errEl.closest('label') || errEl;
    candidate.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // briefly highlight the target for user attention
    candidate.style.transition = 'box-shadow 0.3s ease';
    const previousBox = candidate.style.boxShadow;
    candidate.style.boxShadow = '0 0 0 4px rgba(219,39,119,0.12)';
    setTimeout(() => { candidate.style.boxShadow = previousBox; }, 1400);
    return;
  }

  // Fallback: find first input/select/textarea with invalid attribute or empty required fields
  const inputs = Array.from(document.querySelectorAll('input,select,textarea'));
  for (const inp of inputs) {
    // if it has a sibling .err or aria-invalid
    if (inp.getAttribute('aria-invalid') === 'true' || inp.classList.contains('invalid')) {
      inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    // visible and empty required fields commonly flagged by your validate -> errors map
    if (inp.offsetParent !== null && inp.required && !inp.value) {
      inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  }

  // last fallback: scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);


 const handleSubmit = useCallback(async (e) => {
  e.preventDefault()
  const v = validate()
  setErrors(v)

   if (Object.keys(v).length) {
    // Instead of a popup, scroll to the first mandatory field that has an error
    // small delay to allow DOM to render error messages
    setTimeout(() => {
      scrollToFirstError()
    }, 100)
    return
  }

  setIsSubmitting(true)

  try {
const accessToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken')  
 
if (!accessToken) {
      throw new Error('User not logged in. Please log in first.')
    }

    // ✅ Create FormData (backend uses multer for image_file)
    const formData = new FormData()
    
    // ✅ Add profile picture
    if (profilePicFile) {
      formData.append('image_file', profilePicFile)
    }

    const form = mode === 'upload' ? uploadForm : manualForm

    // ✅ Personal Information
    if (form.firstName) formData.append('first_name', form.firstName)
    if (form.lastName) formData.append('last_name', form.lastName)
    if (form.age) formData.append('age', form.age)
    if (form.gender) formData.append('gender', form.gender)
    if (form.maritalStatus) formData.append('marital_status', form.maritalStatus)
    
    // Backend gets email, phone, dob from signup table using userId from token
    // Backend doesn't have aadhaar field
    
    // ✅ Education & Career
    if (form.Education) formData.append('education', form.Education)
    if (form.profession) formData.append('profession', form.profession)
    if (form.Income) formData.append('income', form.Income)
    if (form.Location) formData.append('location', form.Location)
    
    // ✅ Religious Background
    if (form.religion) formData.append('religion', form.religion)
    if (form.community) formData.append('community', form.community)
    if (form.caste) formData.append('caste', form.caste)
    if (form.motherTongue) formData.append('mother_tongue', form.motherTongue)
    
    // ✅ Family
    if (form.familyType) formData.append('family_type', form.familyType)
    if (form.siblings) formData.append('number_of_siblings', form.siblings)
    
    // ✅ Physical
    if (form.heightCm) formData.append('height', form.heightCm)
    if (form.weightKg) formData.append('weight', form.weightKg)
    
    // ✅ About
    if (form.hobbies) formData.append('hobbies', form.hobbies)
    if (form.about) formData.append('about_me', form.about)
    

    // Handle extracted profile data for upload mode
    if (mode === 'upload' && extractedProfile && Object.keys(extractedProfile).length) {
      const ep = extractedProfile

      if (!form.firstName && !form.lastName && ep.fullName) {
        const parts = String(ep.fullName).trim().split(/\s+/)
        if (parts.length) {
          formData.append('first_name', parts[0])
          formData.append('last_name', parts.slice(1).join(' ') || '')
        }
      }

      // Note: Don't send dob from extracted profile - backend gets it from signup table

      if (!form.gender && ep.gender) formData.append('gender', ep.gender)
      if (!form.Education && ep.education) formData.append('education', ep.education)
      if (!form.profession && ep.occupation) formData.append('profession', ep.occupation)
      if (!form.Income && ep.income) formData.append('income', ep.income)
      if (!form.Location && ep.location) formData.append('location', ep.location)
      if (!form.religion && ep.religion) formData.append('religion', ep.religion)
      if (!form.caste && ep.caste) formData.append('caste', ep.caste)
      if (!form.motherTongue && ep.motherTongue) formData.append('mother_tongue', ep.motherTongue)
      if (!form.heightCm && ep.height) {
        const hcm = extractHeightInCm(ep.height) || ep.height
        formData.append('height', hcm)
      }
      if (!form.about && ep.aboutMe) formData.append('about_me', ep.aboutMe)
    }

    // ✅ Send to backend (backend has verifyAccessToken middleware)
    const response = await fetch(`https://cliff-unseductive-mariam.ngrok-free.dev/api/register/user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
        // ❌ DON'T set Content-Type - browser sets it automatically with boundary for FormData
      },
      body: formData
    })

    console.log('📡 Response status:', response.status)

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        console.error('❌ Server error response:', errorData)
        throw new Error(errorData.message || `Server error: ${response.status}`)
      } else {
        throw new Error(`Server error (${response.status})`)
      }
    }

    let result
    try {
      result = await response.json()
      console.log('✅ SUCCESS Response:', result)
    } catch (parseError) {
      throw new Error('Invalid response from server: ' + parseError.message)
    }

    // ✅ SUCCESS
    if (mode === 'upload' && setExtractedProfile) setExtractedProfile(null)
    setShowPopup(true)
    resetAllForms()

  } catch (error) {
    console.error('❌ Registration error:', error)
    setErrors({ general: error.message || 'Registration failed. Please try again.' })
    alert('Registration failed: ' + (error.message || 'Please try again'))
  } finally {
    setIsSubmitting(false)
  }
}, [mode, validate, uploadForm, manualForm, profilePicFile, extractedProfile, resetAllForms])

  const closeSuccessPopup = useCallback(() => {
  setShowPopup(false)
  resetAllForms()
  navigate('/home')
}, [resetAllForms, navigate])

  const resetForm = useCallback(() => {
    if (mode === 'upload') {
      setUploadForm(INITIAL_UPLOAD_FORM)
      setFile(null)
    } else {
      setManualForm(INITIAL_MANUAL_FORM)
    }
    setProfilePicFile(null)
    setProfilePicPreview(null)
    setErrors({})
    setOtpState(INITIAL_OTP_STATE)
  }, [mode])

  const downloadTemplate = useCallback(() => {
    const sheetData = [
      ["HEAVENMATCH REGISTRATION TEMPLATE"],
      ["Please fill in your details below."],
      [],
      ["First Name"],["Last Name"],["Dob"] ["Age"], ["Gender(Female,Male,Other)"], ["Marital Status(Single,Divorced,Widowed)"], ["Email"], ["Phone"],
      ["Education"], ["Profession"], ["Income"], ["Location"],
      ["Religion"], ["Community"], ["Caste"], ["Mother Tongue"],
      ["Family Type(Nuclear,Joint)"], ["No. of Siblings"],
      ["Height (cm)"], ["Weight (kg)"],
      ["Hobbies"], ["About Me"], ["Partner Preferences"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HeavenMatch Template");
    XLSX.writeFile(workbook, "HeavenMatch_Registration_Template.xlsx");
  }, []);

  return (
    <div className="reg-container">
      <section className="reg-card">
        <h2>Profile Registration</h2>
        <div className="modes">
          <button className={mode==='upload'? 'active':''} onClick={()=>handleModeSwitch('upload')}>
            Upload (File / Link)
          </button>
          <button className={mode==='manual'? 'active':''} onClick={()=>handleModeSwitch('manual')}>
            Fill Manual
          </button>
        </div>

        <form onSubmit={handleSubmit} className="reg-form" noValidate>
          {mode === 'upload' ? (
            <>
              <div className="template-download-section">
                <p className="template-info">
                  Don't have a profile document? Download the template to fill in your details.
                </p>
                <button type="button" className="btn-download-template" onClick={downloadTemplate}>
                  📄 Download Template (Excel)
                </button>
              </div>

              <div className="upload-profile-box" style={{ maxWidth: 520 }}>
                <label className="file-upload">Upload Your Profile (PDF)
                  <input ref={uploadFileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFile} />
                </label>

                {file && uploadForm.fileName ? (
  <div
    className="file-info-row"
    style={{
      marginTop: 8,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    }}
  >
    <span className="file-info">Selected: {uploadForm.fileName}</span>
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        onClick={removeUploadedFile}
        className="btn-remove"
      >
        Remove
      </button>
    </div>
  </div>
) : null}

              </div>

              <label>Profile Link (Google Drive / LinkedIn)
                <input name="profileLink" value={form.profileLink} onChange={handleChange}/>
                {errors.profileLink && <small className="err">{errors.profileLink}</small>}
              </label>

              {errors.upload && <small className="err">{errors.upload}</small>}

              <EmailField
                email={form.email}
                emailIsGmail={emailIsGmail}
                otpState={otpState}
                errors={errors}
                onChange={handleChange}
                onSendOtp={sendOtp}
                onVerifyOtp={verifyOtp}
                onOtpInputChange={handleOtpInputChange}
              />

              <label>Phone *
                <input name="phone" value={form.phone} onChange={handleChange} />
                {errors.phone && <small className="err">{errors.phone}</small>}
              </label>

              <label>Aadhaar Number *
                <input
                  name="aadhaar"
                  value={maskedAadhaar || form.aadhaar}
                  onChange={(e) => {
                    handleChange(e);
                    setMaskedAadhaar(e.target.value);
                  }}
                  onBlur={() => setMaskedAadhaar(maskAadhaar(form.aadhaar))}
                  onFocus={() => setMaskedAadhaar(form.aadhaar)}
                />
                {errors.aadhaar && <small className="err">{errors.aadhaar}</small>}
              </label>

              {extractedProfile && (
  <ExtractedProfileDetails
    ep={extractedProfile}
    onDiscard={discardExtractedProfile}
    onEdit={openManualFromExtracted}
  />
)}

            </>
          ) : (
            <>
              <div className='pink-box' style={{display:'flex', gap:16, alignItems:'flex-start'}}>
                <div style={{flex: '1 1 60%'}}>
                  <h3>Personal information</h3>

                  <div style={{display:'flex', gap:12, marginBottom:12}}>
                    <label style={{flex:1}}>First name *
                      <input name="firstName" value={form.firstName} onChange={handleChange} />
                      {errors.firstName && <small className="err">{errors.firstName}</small>}
                    </label>

                    <label style={{flex:1}}>Last name
                      <input name="lastName" value={form.lastName} onChange={handleChange} />
                    </label>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <label>DOB *
                      <input
                        name="dob"
                        type="date"
                        value={form.dob || ''}
                        onChange={handleDobChange}
                        min={DOB_MIN}
                        max={DOB_MAX}
                      />
                      {errors.age && <small className="err">{errors.age}</small>}
                    </label>

                    <label>Age *
                      <input name="age" value={form.age || ''} readOnly type="number" min="18" />
                    </label>

                    <label>Gender *
                      <select name="gender" value={form.gender} onChange={handleChange}>
                        <option value="">Select</option>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                      {errors.gender && <small className="err">{errors.gender}</small>}
                    </label>

                    <label>Marital status
                      <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                        <option value="">Select</option>
                        <option>Single</option>
                        <option>Divorced</option>
                        <option>Widowed</option>
                      </select>
                    </label>
                  </div>

                  <div style={{marginBottom:12}}>
                    <EmailField
                      email={form.email}
                      emailIsGmail={emailIsGmail}
                      otpState={otpState}
                      errors={errors}
                      onChange={handleChange}
                      onSendOtp={sendOtp}
                      onVerifyOtp={verifyOtp}
                      onOtpInputChange={handleOtpInputChange}
                    />
                  </div>

                  <label>Phone *
                    <input name="phone" value={form.phone} onChange={handleChange} />
                    {errors.phone && <small className="err">{errors.phone}</small>}
                  </label>
                </div>

                <div className="manual-profile-column" style={{flex: '0 0 auto', marginLeft: 8}}>
                  <ProfilePictureBox
                    profilePicFile={profilePicFile}
                    profilePicPreview={profilePicPreview}
                    error={errors.profilePicture}
                    onFileChange={handleProfilePic}
                    onRemove={removeProfilePicture}
                    inputRef={profilePicInputRef}
                  />
                </div>
              </div>

              <div className='pink-box'>
                <h3>Education and career</h3>
                <label>Education *
                  <input name="Education" value={form.Education} onChange={handleChange} />
                  {errors.Education && <small className="err">{errors.Education}</small>}
                </label>

                <label>Profession
                  <input name="profession" value={form.profession} onChange={handleChange} />
                </label>

                <div className="flex-row">
                  <label>Income *
                    <input name="Income" value={form.Income} onChange={handleChange} />
                    {errors.Income && <small className="err">{errors.Income}</small>}
                  </label>

                  <label>Location 
                    <input name="Location" value={form.Location} onChange={handleChange} />
                  </label>
                </div>
              </div>

              <div className='pink-box'>
                <h3>Religious Background</h3>
                <div className="flex-row">
                  <label>Religion
                    <input name="religion" value={form.religion} onChange={handleChange} />
                  </label>

                  <label>Community
                    <input name="community" value={form.community} onChange={handleChange} />
                  </label>

                  <label>Caste
                    <input name="caste" value={form.caste} onChange={handleChange} />
                  </label>
                </div>

                <label>Mother Tongue
                  <input name="motherTongue" value={form.motherTongue} onChange={handleChange} />
                </label>
              </div>

              <div className='pink-box'>
                <h3>Family Details</h3>
                <div className="flex-row">
                  <label>Family Type 
                    <select name="familyType" value={form.familyType} onChange={handleChange}>
                      <option value="">Select</option>
                      <option>Nuclear</option>
                      <option>Joint</option>
                    </select>
                  </label>

                  <label>No. of siblings
                    <input name="siblings" value={form.siblings} onChange={handleChange} />
                  </label>
                </div>
              </div>

              <div className='pink-box'>
                <h3>Physical Attributes</h3>
                <div className="flex-row">
                  <label>Height (cm)
                    <input name="heightCm" value={form.heightCm} onChange={handleChange} />
                    {errors.heightCm && <small className="err">{errors.heightCm}</small>}
                  </label>

                  <label>Weight (kg)
                    <input name="weightKg" value={form.weightKg} onChange={handleChange} />
                    {errors.weightKg && <small className="err">{errors.weightKg}</small>}
                  </label>
                </div>
              </div>

              <div className='pink-box'>
                <h3>About Me & Partner preferences</h3>
                <label>Hobbies 
                  <input name="hobbies" value={form.hobbies || ''} onChange={handleChange} />
                </label>

                <div className="spacer" />
                <label>About Me - Tell about yourself
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={(e) => {
                      const safeValue = sanitizeText(e.target.value);
                      handleChange({ target: { name: 'about', value: safeValue } });
                    }}
                    rows={4}
                  />
                </label>

                <div className="spacer" />

                <label>Partner preferences
                  <textarea
                    name="partnerPreferences"
                    value={form.partnerPreferences}
                    onChange={(e) => {
                      const safeValue = sanitizeText(e.target.value);
                      if (safeValue === form.about) {
                        setErrors(prev => ({ ...prev, partnerPreferences: 'Partner preferences cannot be identical to About Me.' }));
                      } else {
                        setErrors(prev => { const copy = { ...prev }; delete copy.partnerPreferences; return copy; });
                      }
                      handleChange({ target: { name: 'partnerPreferences', value: safeValue } });
                    }}
                    rows={3}
                  />
                  {errors.partnerPreferences && <small className="err">{errors.partnerPreferences}</small>}
                </label>
              </div>

              <div className="aadhaar-section">
                <label>Aadhaar Number *
                  <input
                    name="aadhaar"
                    value={maskedAadhaar || form.aadhaar}
                    onChange={(e) => { handleChange(e); setMaskedAadhaar(e.target.value); }}
                    onBlur={() => setMaskedAadhaar(maskAadhaar(form.aadhaar))}
                    onFocus={() => setMaskedAadhaar(form.aadhaar)}
                  />
                  {errors.aadhaar && <small className="err">{errors.aadhaar}</small>}
                </label>
              </div>
            </>
          )}

          <div className="actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
            <button type="button" className="secondary" onClick={resetForm}>Reset</button>
          </div>
        </form>

        {mode === 'upload' && (
          <aside className="help">
            <ProfilePictureBox
              profilePicFile={profilePicFile}
              profilePicPreview={profilePicPreview}
              error={errors.profilePicture}
              onFileChange={handleProfilePic}
              onRemove={removeProfilePicture}
              inputRef={profilePicInputRef}
            />
          </aside>
        )}

        {showPopup && (
          <div className="modal-overlay">
            <div className="modal-content modal-success">
              <h2>Registration Successful</h2>
              <button onClick={closeSuccessPopup}>OK</button>
            </div>
          </div>
        )}


        {showSwitchWarning && (
          <div className="modal-overlay">
            <div className="modal-content modal-warning">
              <h3>⚠️ Warning</h3>
              <p>You have unsaved data. Switching modes will clear all entered information.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={cancelModeSwitch}>Cancel</button>
                <button className="btn-confirm" onClick={confirmModeSwitch}>Continue</button>
              </div>
            </div>
          </div>
        )}
      </section>

      <style>{`
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .spacer {
          height: 20px;
        }
        
        .aadhaar-section {
          margin-top: 8px;
        }

        .otp-row {
          margin: 8px 0;
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .profile-box {
          border: 1px solid #db2777;
          padding: 12px;
          border-radius: 8px;
          background: #fff;
          box-sizing: border-box;
          width: 100%;
          min-height: 110px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
        }

        .profile-box-inner {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .profile-preview-box {
          margin-top: 8px;
          width: 100%;
          max-width: 260px;
          height: 260px;
          background: #f3f4f6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .profile-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          border-radius: 10px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        .modal-success h2 {
          color: #db2777;
          margin-bottom: 20px;
        }
        
        .modal-success button {
          background-color: #db2777;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .modal-error h3 {
          color: #db2777;
          margin-bottom: 10px;
        }
        
        .modal-error button {
          background-color: #db2777;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .modal-warning h3 {
          color: #db2777;
          margin-bottom: 15px;
        }
        
        .modal-warning p {
          color: #666;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        
        .btn-cancel {
          background-color: #6b7280;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .btn-confirm {
          background-color: #db2777;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .btn-cancel:hover {
          background-color: #4b5563;
        }
        
        .btn-confirm:hover {
          background-color: #b91c73;
        }

        .btn-remove-small {
          background: #db2777;
          border: 1px solid #db2777;
          color: white;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-remove-small:hover { 
          background: white;
          color:#db2777;
        }
        
        input, textarea {
          font-family: inherit;
          font-size: 14px;
          color: #333;
        }

        .success {
          color: #059669;
          font-weight: 600;
        }
        
        .otp-verified-inline { 
          margin: 8px 0; 
        }

        .err {
          color: #dc2626;
          font-size: 13px;
          margin-top: 4px;
          display: block;
        }

        .otp-entry {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .otp-entry input {
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }

        .otp-entry button {
          padding: 8px 16px;
          background-color: #db2777;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .pink-box {
          border: 2px solid #db2777;
          background:linear-gradient(180deg,#ffeef2,#fff);
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .pink-box h3 {
          color: #db2777;
          margin-bottom: 12px;
          font-size: 16px;
        }

        .flex-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .flex-row label {
          flex: 1;
        }

        label {
          display: block;
          margin-bottom: 12px;
          font-weight: 500;
          color: #374151;
        }

        input, select, textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-top: 4px;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .actions button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .actions button[type="submit"] {
          background-color: #db2777;
          color: white;
        }

        .actions button[type="submit"]:disabled {
          background-color: #f5b6d1;
          cursor: not-allowed;
        }

        .actions button.secondary {
          background-color: #e5e7eb;
          color: #374151;
        }

        .file-upload {
          cursor: pointer;
        }

        .file-info {
          margin-top: 8px;
          color: #6b7280;
          font-size: 13px;
        }

        .modes {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .modes button {
          flex: 1;
          padding: 10px;
          border: 2px solid #db2777;
          background: white;
          color: #db2777;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .modes button.active {
          background-color: #db2777;
          color: white;
        }

        .reg-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          box-sizing: border-box;
        }

        .profile-box-error {
          color: #dc2626;
          font-size: 13px;
          font-weight: 0;
          margin-top: 6px;
          align-self: flex-start;
          padding: 6px 8px;
          border-radius: 6px;
        }

        .profile-box-file {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-top: 6px;
          font-size: 13px;
          color: #374151;
        }

        .profile-box-file .file-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .reg-card{
          display:grid;
          grid-template-columns:1fr 300px;
          gap:18px;
          background: white;
          padding:24px;
          border-radius:10px;
          box-shadow:0 6px 20px rgba(0,0,0,0.06);
        }

        .reg-card h2{
          color: #db2777;
          margin:0 0 16px 0;
          grid-column: 1 / -1;
        }

        .help {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          box-shadow: none;
          padding: 0;
        }

        .manual-profile-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 260px;
          box-sizing: border-box;
        }

        .template-download-section {
          background-color: #fce7f3;
          border: 2px dashed #db2777;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          text-align: center;
        }

        .template-info {
          color: #db2777;
          margin: 0 0 12px 0;
          font-size: 14px;
        }

        .btn-download-template {
          background-color: #db2777;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-download-template:hover {
          background-color: #b91c73;
        }

        .email-verify-btn {
          background-color: #db2777;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .email-verify-btn:hover:not(:disabled) {
          background-color: #c71c6f;
        }

        .email-verify-btn:disabled {
          background-color: #f5b6d1;
          cursor: not-allowed;
        }

        .btn-remove {
          background: #6b7280;
          border: 1px solid #6b7280;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
        }

        .btn-remove:hover {
          background: #4b5563;
        }

        .upload-profile-box {
          border: 2px dashed #db2777;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          background: #fff;
        }

        .reg-form {
          grid-column: 1;
        }

        @media (max-width: 768px) {
          .reg-card {
            grid-template-columns: 1fr;
          }

          .help {
            grid-column: 1;
          }

          .pink-box {
            flex-direction: column;
          }

          .manual-profile-column {
            max-width: 100%;
          }

          .flex-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}