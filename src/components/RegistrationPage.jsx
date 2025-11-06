import React, { useState, useEffect } from 'react'
import '../styles/register.css'

// Constants for form initial states
const INITIAL_UPLOAD_FORM = {
  email: '',
  phone: '',
  fileName: '',
  profileLink: '',
  aadhaar: '',
  consentAadhaar: false,
  profilePictureName: '' // stores filename for display
}

const INITIAL_MANUAL_FORM = {
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
  maritalStatus: '',
  email: '',
  phone: '',
  Education: '',
  profession: '',
  Income: '',
  Location: '',
  religion: '',
  community: '',
  caste: '',
  motherTongue: '',
  familyType: '',
  siblings: '',
  heightCm: '',
  weightKg: '',
  about: '',
  partnerPreferences: '',
  hobbies: '',
  aadhaar: '',
  consentAadhaar: false,
  profilePictureName: ''
}

// Validation helper functions (defined once, not recreated on every validation)
const isBlank = s => !s || String(s).trim().length === 0
const looksLikeEmail = s => /\S+@\S+\.\S+/.test(String(s || '').trim())
const looksLikePhone = s => /^[0-9+\-\s]{6,20}$/.test(String(s || '').trim())
const looksLikeAadhaar = s => /^[0-9]{12}$/.test(String(s || '').trim())

// Reusable Aadhaar validation - returns true if there's an error
const validateAadhaar = (form, errs) => {
  let hasAadhaarError = false
  if (isBlank(form.aadhaar) || !looksLikeAadhaar(form.aadhaar)) {
    errs.aadhaar = 'Enter a valid 12-digit Aadhaar number'
    hasAadhaarError = true
  }
  if (form.consentAadhaar !== true) {
    errs.consentAadhaar = 'Consent for verification is required'
    hasAadhaarError = true
  }
  return hasAadhaarError
}

export default function RegistrationPage(){
  const [mode, setMode] = useState('upload')
  const [showPopup, setShowPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [uploadForm, setUploadForm] = useState(INITIAL_UPLOAD_FORM)
  const [manualForm, setManualForm] = useState(INITIAL_MANUAL_FORM)
  const [file, setFile] = useState(null)
  const [profilePicFile, setProfilePicFile] = useState(null)
  const [profilePicPreview, setProfilePicPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [showSwitchWarning, setShowSwitchWarning] = useState(false)
  const [pendingMode, setPendingMode] = useState(null)

  // Get active form based on mode
  const form = mode === 'upload' ? uploadForm : manualForm

  // Clean up object URL when profilePicFile changes or component unmounts
  useEffect(() => {
    if (!profilePicFile) {
      setProfilePicPreview(null)
      return
    }
    const url = URL.createObjectURL(profilePicFile)
    setProfilePicPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [profilePicFile])

  // Check if current form has any data filled
  const isFormFilled = () => {
    if (mode === 'upload') {
      return !!(uploadForm.email || uploadForm.phone || uploadForm.profileLink || 
                uploadForm.aadhaar || file || profilePicFile)
    } else {
      return Object.keys(manualForm).some(key => {
        const value = manualForm[key]
        return key !== 'consentAadhaar' && value && String(value).trim().length > 0
      }) || !!profilePicFile
    }
  }

  // Handles mode switching with warning if form is filled
  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return
    
    if (isFormFilled()) {
      setPendingMode(newMode)
      setShowSwitchWarning(true)
    } else {
      setMode(newMode)
      setErrors({})
    }
  }

  // Confirms mode switch and resets current form
  const confirmModeSwitch = () => {
    if (mode === 'upload') {
      setUploadForm(INITIAL_UPLOAD_FORM)
      setFile(null)
      removeProfilePicture()
    } else {
      setManualForm(INITIAL_MANUAL_FORM)
      removeProfilePicture()
    }
    setMode(pendingMode)
    setErrors({})
    setShowSwitchWarning(false)
    setPendingMode(null)
  }

  // Cancels mode switch
  const cancelModeSwitch = () => {
    setShowSwitchWarning(false)
    setPendingMode(null)
  }

  // Handles changes to form inputs for the active mode
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    
    if (mode === 'upload') {
      setUploadForm(prev => ({ ...prev, [name]: val }))
    } else {
      setManualForm(prev => ({ ...prev, [name]: val }))
    }
  }

  // Handles file upload and updates the fileName in upload form state
  const handleFile = (e) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setUploadForm(prev => ({ ...prev, fileName: f ? f.name : '' }))
  }

  // Handles profile picture upload for both modes; enforces <5MB and shows preview
  const handleProfilePic = (e) => {
    const f = e.target.files?.[0] || null
    if (!f) return

    // size check (5MB = 5 * 1024 * 1024)
    const MAX = 5 * 1024 * 1024
    if (f.size > MAX) {
      setErrors(prev => ({ ...prev, profilePicture: 'Profile picture must be less than 5 MB' }))
      return
    }

    // clear profile picture error
    setErrors(prev => {
      const copy = { ...prev }
      delete copy.profilePicture
      return copy
    })

    setProfilePicFile(f)
    if (mode === 'upload') {
      setUploadForm(prev => ({ ...prev, profilePictureName: f.name }))
    } else {
      setManualForm(prev => ({ ...prev, profilePictureName: f.name }))
    }
  }

  const removeProfilePicture = () => {
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
  }

  // ---------- paste this validate() ----------
const validate = () => {
  const errs = {}

  // --- MANUAL MODE ---
  if (mode === 'manual') {
    let requiredMissing = false
    const reasons = [] // collect reasons for easier logging

    // First name
    if (isBlank(manualForm.firstName)) {
      errs.firstName = 'First name is required'
      requiredMissing = true
      reasons.push('firstName')
    }

    // Age (required, numeric, 18-50)
    const ageRaw = String(manualForm.age || '').trim()
    const ageNum = Number(ageRaw)
    if (isBlank(ageRaw) || Number.isNaN(ageNum)) {
      errs.age = 'Age is required'
      requiredMissing = true
      reasons.push('age-empty-or-non-numeric')
    } else if (ageNum < 18 || ageNum > 50) {
      errs.age = 'Age must be between 18 and 50'
      requiredMissing = true
      reasons.push('age-out-of-range')
    }

    // Gender
    if (isBlank(manualForm.gender)) {
      errs.gender = 'Gender is required'
      requiredMissing = true
      reasons.push('gender')
    }

    // Email
    const emailVal = String(manualForm.email || '').trim()
    if (isBlank(emailVal)) {
      errs.email = 'Email is required'
      requiredMissing = true
      reasons.push('email-empty')
    } else if (!looksLikeEmail(emailVal)) {
      errs.email = 'Enter a valid email'
      requiredMissing = true
      reasons.push('email-format')
    }

    // Phone
    const phoneVal = String(manualForm.phone || '').trim()
    if (isBlank(phoneVal)) {
      errs.phone = 'Phone is required'
      requiredMissing = true
      reasons.push('phone-empty')
    } else if (!looksLikePhone(phoneVal)) {
      errs.phone = 'Enter a valid phone number'
      requiredMissing = true
      reasons.push('phone-format')
    }

    // Education
    if (isBlank(manualForm.Education)) {
      errs.Education = 'Education is required'
      requiredMissing = true
      reasons.push('education')
    }

    // Income (required + numeric)
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

    // Aadhaar & consent (uses helper)
    const aadErrs = {}
    const aadHasError = validateAadhaar(manualForm, aadErrs)
    if (aadHasError) {
      Object.assign(errs, aadErrs)
      requiredMissing = true
      reasons.push('aadhaar-or-consent')
    }

    // Optional numeric inputs -> inline only
    if (manualForm.heightCm && isNaN(Number(String(manualForm.heightCm).trim()))) {
      errs.heightCm = 'Enter a valid number'
    }
    if (manualForm.weightKg && isNaN(Number(String(manualForm.weightKg).trim()))) {
      errs.weightKg = 'Enter a valid number'
    }

    // Profile picture inline validation (use profilePicFile)
    if (profilePicFile) {
      const MAX = 5 * 1024 * 1024
      if (profilePicFile.size > MAX) {
        errs.profilePicture = 'Profile picture must be less than 5 MB'
      } else if (!/^image\//.test(profilePicFile.type || '')) {
        errs.profilePicture = 'Only image files (jpeg/png) allowed'
      }
      // NOTE: profilePicture errors are inline only -> DO NOT set requiredMissing
    }

    if (requiredMissing) {
      errs.general = true
      // helpful debug key
      errs._debug = { reasons }
    }

    console.log('validate(manual) ->', errs)
    return errs
  }

  // --- UPLOAD MODE ---
  // required: either file OR profileLink; plus email, phone, aadhaar+consent
  if (!file && isBlank(uploadForm.profileLink)) {
    errs.upload = 'Please upload a file or paste a profile link'
  }
  if (!isBlank(uploadForm.profileLink) && !String(uploadForm.profileLink).trim().startsWith('http')) {
    errs.profileLink = 'Paste a valid link (starting with http)'
  }

  const emailVal2 = String(uploadForm.email || '').trim()
  if (isBlank(emailVal2)) {
    errs.email = 'Email is required'
  } else if (!looksLikeEmail(emailVal2)) {
    errs.email = 'Enter a valid email'
  }

  const phoneVal2 = String(uploadForm.phone || '').trim()
  if (isBlank(phoneVal2)) {
    errs.phone = 'Phone number is required'
  } else if (!looksLikePhone(phoneVal2)) {
    errs.phone = 'Enter a valid phone number'
  }

  // Aadhaar
  const aad2 = {}
  const aadHasErr2 = validateAadhaar(uploadForm, aad2)
  if (aadHasErr2) {
    Object.assign(errs, aad2)
  }

  // profilePic inline validation for upload
  if (profilePicFile) {
    const MAX = 5 * 1024 * 1024
    if (profilePicFile.size > MAX) {
      errs.profilePicture = 'Profile picture must be less than 5 MB'
    } else if (!/^image\//.test(profilePicFile.type || '')) {
      errs.profilePicture = 'Only image files (jpeg/png) allowed'
    }
  }

  // mark general only if mandatory upload fields missing (email/phone/aadhaar/upload)
  const requiredUploadMissing = !!(errs.email || errs.phone || errs.aadhaar || errs.upload)
  if (requiredUploadMissing) {
    errs.general = true
    errs._debug = { requiredUploadMissing: true }
  }

  console.log('validate(upload) ->', errs)
  return errs
}

// ---------- paste this handleSubmit() ----------
const handleSubmit = (e) => {
  e.preventDefault()
  // run validate which logs its result too
  const v = validate()

  // setErrors so UI shows inline messages
  setErrors(v)

  // debug: print validate output (user can paste this if still failing)
  console.log('handleSubmit validate result:', v)

  if (Object.keys(v).length) {
    // popup only for required-field problems
    if (v.general) {
      setShowErrorPopup(true)
    }
    return
  }

  const payload = {
    ...(mode === 'upload' ? uploadForm : manualForm),
    file: file ? { name: file.name, size: file.size } : null,
    profilePicture: profilePicFile ? { name: profilePicFile.name, size: profilePicFile.size, type: profilePicFile.type } : null,
    registeredAt: new Date().toISOString(),
    mode
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Registration payload:', payload)
  }

  setShowPopup(true)
}



  // Closes success popup and resets forms
  const closeSuccessPopup = () => {
    setShowPopup(false)
    setUploadForm(INITIAL_UPLOAD_FORM)
    setManualForm(INITIAL_MANUAL_FORM)
    setFile(null)
    removeProfilePicture()
    setErrors({})
  }

  // Resets the current mode's form to initial state
  const resetForm = () => {
    if (mode === 'upload') {
      setUploadForm(INITIAL_UPLOAD_FORM)
      setFile(null)
    } else {
      setManualForm(INITIAL_MANUAL_FORM)
    }
    removeProfilePicture()
    setErrors({})
  }

  return (
    <div className="reg-container">
      <header className="reg-header">
        <div className="logo-heart">❤</div>
        <div className="brand">
          <h1>HeavenMatch</h1>
          <p className="tag">Find a right match</p>
        </div>
      </header>

      <section className="reg-card">
        <h2>Registration</h2>
        <div className="modes">
          <button className={mode==='upload'? 'active':''} onClick={()=>handleModeSwitch('upload')}>Upload (File / Link)</button>
          <button className={mode==='manual'? 'active':''} onClick={()=>handleModeSwitch('manual')}>Fill Manual</button>
        </div>

        <form onSubmit={handleSubmit} className="reg-form" noValidate>

          {/* UPLOAD panel */}
          {mode === 'upload' && (
            <>
              <label className="file-upload">Upload Profile File (PDF / Image)
                <input type="file" accept="image/*,application/pdf" onChange={handleFile} />
                {uploadForm.fileName && <div className="file-info">Selected: {uploadForm.fileName}</div>}
              </label>

              {/* Profile picture box for upload mode */}
              <div className="profile-box">
                <label>Profile Picture (&lt; 5 MB)
                  <input type="file" accept="image/*" onChange={handleProfilePic} />
                </label>
                {errors.profilePicture && <small className="err">{errors.profilePicture}</small>}

                <div className="profile-preview">
                  {profilePicPreview ? (
                    <div className="preview-inner">
                      <img src={profilePicPreview} alt="Profile preview" />
                      <div className="preview-actions">
                        <span>{profilePicFile?.name}</span>
                        <button type="button" onClick={removeProfilePicture}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div className="placeholder">No profile picture selected</div>
                  )}
                </div>
              </div>

              <label>Paste Profile Link (Google Drive / LinkedIn)
                <input name="profileLink" value={form.profileLink} onChange={handleChange} placeholder="https://..." />
                {errors.profileLink && <small className="err">{errors.profileLink}</small>}
              </label>

              {errors.upload && <small className="err">{errors.upload}</small>}

              <label>Email *
                <input name="email" value={form.email} onChange={handleChange} />
                {errors.email && <small className="err">{errors.email}</small>}
              </label>

              <label>Phone *
                <input name="phone" value={form.phone} onChange={handleChange} />
                {errors.phone && <small className="err">{errors.phone}</small>}
              </label>

              <label>Aadhaar Number/Gmail *
                <input name="aadhaar" value={form.aadhaar} onChange={handleChange} />
                {errors.aadhaar && <small className="err">{errors.aadhaar}</small>}
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="consentAadhaar"
                  checked={!!form.consentAadhaar}
                  onChange={handleChange}
                />
                <span>I consent to verification (required)</span>
              </label>
              {errors.consentAadhaar && <small className="err">{errors.consentAadhaar}</small>}
            </>
          )}

          {/* MANUAL panel */}
          {mode === 'manual' && (
            <>
            <div className='pink-box'>
              <h3>Personal information</h3>

              {/* Profile picture box for manual mode (replaces aside illustration) */}
              <div className="profile-box-inline">
                <label>Profile Picture (&lt; 5 MB)
                  <input type="file" accept="image/*" onChange={handleProfilePic} />
                </label>
                {errors.profilePicture && <small className="err">{errors.profilePicture}</small>}

                <div className="profile-preview-inline">
                  {profilePicPreview ? (
                    <div className="preview-inner">
                      <img src={profilePicPreview} alt="Profile preview" />
                      <div className="preview-actions">
                        <span>{profilePicFile?.name}</span>
                        <button type="button" onClick={removeProfilePicture}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div className="placeholder">No profile picture selected</div>
                  )}
                </div>
              </div>

              <div className="flex-row">
                <label>First name *
                  <input name="firstName" value={form.firstName} onChange={handleChange} />
                </label>

                <label>Last name
                  <input name="lastName" value={form.lastName} onChange={handleChange} />
                </label>
              </div>

              <div className="flex-row">
                <label>Age *
                  <input name="age" value={form.age} onChange={handleChange} type="number" min="18" />
                </label>

                <label>Gender *
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>Marital status
                  <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                    <option value="">Select</option>
                    <option>Single</option>
                    <option>Seperated</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                </label>
              </div>

              <div className="flex-row">
                <label>Email *
                  <input name="email" value={form.email} onChange={handleChange} />
                </label>

                <label>Phone *
                  <input name="phone" value={form.phone} onChange={handleChange} />
                </label>
              </div>
            </div>
            
            <div className='pink-box'>
              <h3>Education and career</h3>
              <label>Education *
                <input name="Education" value={form.Education} onChange={handleChange} />
              </label>

              <label>Profession
                <input name="profession" value={form.profession} onChange={handleChange} />
              </label>

              <div className="flex-row">
                <label>Income *
                  <input name="Income" value={form.Income} onChange={handleChange} />
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
                </label>

                <label>Weight (kg)
                  <input name="weightKg" value={form.weightKg} onChange={handleChange} />
                </label>
              </div>
            </div>

            <div className='pink-box'>
              <h3>About Me & Partner preferences</h3>
              <label>Hobbies 
                <input
                  name="hobbies"
                  value={form.hobbies || ''}
                  onChange={handleChange}
                />
              </label>

              <div className="spacer" />
              <label>About Me - Tell about yourself
                <textarea name="about" value={form.about} onChange={handleChange} rows={4} />
              </label>

              <div className="spacer" />

              <label>Partner preferences
                <textarea name="partnerPreferences" value={form.partnerPreferences} onChange={handleChange} rows={3} />
              </label>
            </div>

            <div className="aadhaar-section">
              <label>Aadhaar Number/Gmail *
                <input name="aadhaar" value={form.aadhaar} onChange={handleChange}  />
                {errors.aadhaar && <small className="err">{errors.aadhaar}</small>}
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="consentAadhaar"
                  checked={!!form.consentAadhaar}
                  onChange={handleChange}
                />
                <span>I consent to verification (required)</span>
              </label>
              {errors.consentAadhaar && <small className="err">{errors.consentAadhaar}</small>}
            </div>
            </>
          )}

          <div className="actions">
            <button type="submit">Register</button>
            <button type="button" className="secondary" onClick={resetForm}>Reset</button>
          </div>
        </form>

        {/* replaced aside illustration with profile picture box for upload/manual */}
        {/* Only show aside when upload mode and no profile picture selected? user requested replacing it with profile picture box; we already show inline box above, but keep an aside for larger preview */}
        {mode === 'upload' && (
          <aside className="help">
            <div className="help-profile-large">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Profile large preview" className="help-image" />
              ) : (
                <div className="help-placeholder">Profile picture will appear here</div>
              )}
            </div>
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

        {showErrorPopup && (
          <div className="modal-overlay">
            <div className="modal-content modal-error">
              <h3>Kindly fill all necessary details</h3>
              <button onClick={() => setShowErrorPopup(false)}>OK</button>
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

      <footer className="reg-footer">© {new Date().getFullYear()} HeavenMatch</footer>

      <style jsx>{`
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
        
        .help-image {
          width: 100%;
          border-radius: 10px;
          height: 100%;
          object-fit: cover;
        }

        .help-placeholder {
          width: 100%;
          height: 220px;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#f3f4f6;
          border-radius:10px;
          color:#6b7280;
        }

        .profile-box, .profile-box-inline {
          border: 1px dashed #e5e7eb;
          padding: 12px;
          border-radius: 8px;
          margin: 10px 0;
        }

        .profile-preview, .profile-preview-inline {
          margin-top: 8px;
        }

        .preview-inner {
          display:flex;
          gap:10px;
          align-items:center;
        }

        .preview-inner img {
          width:72px;
          height:72px;
          object-fit:cover;
          border-radius:8px;
          border:1px solid #e5e7eb;
        }

        .preview-actions {
          display:flex;
          flex-direction:column;
          gap:6px;
        }

        .placeholder {
          color:#6b7280;
          font-size:14px;
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
          background-color: #db2777;
        }
        
        input, textarea {
          font-family: inherit;
          font-size: 14px;
          color: #333;
        }
      `}</style>
    </div>
  )
}
