import React, { useState } from 'react'

export default function RegistrationPage(){
  const [mode, setMode] = useState('upload') // 'upload' | 'manual'
  const [showPopup, setShowPopup] = useState(false) //Registration Successful
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [form, setForm] = useState({
    // Personal
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    maritalStatus: '',
    email: '',
    phone: '',

    // Education & career
    highestEducation: '',
    occupation: '',
    annualIncome: '',
    currentLocation: '',

    // Religious background
    religion: '',
    community: '',
    caste: '',
    motherTongue: '',

    // Family details
    familyType: '',
    siblings: '',

    // Physical
    heightCm: '',
    weightKg: '',

    // About / preferences
    about: '',
    partnerPreferences: '',

    // upload extras
    fileName: '',
    profileLink: '',

    // Aadhaar & consent (added)
    aadhaar: '',
    consentAadhaar: false
  })

  const [file, setFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  // small change: support checkbox inputs (consentAadhaar)
  function handleChange(e){
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleFile(e){
    const f = e.target.files?.[0] || null
    setFile(f)
    setForm(prev => ({ ...prev, fileName: f ? f.name : '' }))
  }

  //list of Validations
function validate(){
  const errs = {}
  const isBlank = s => !s || String(s).trim().length === 0
  const looksLikeEmail = s => /\S+@\S+\.\S+/.test(String(s || '').trim())
  const looksLikePhone = s => /^[0-9+\-\s]{6,20}$/.test(String(s || '').trim())
  const looksLikeAadhaar = s => /^[0-9]{12}$/.test(String(s || '').trim())

  if (mode === 'manual') {
    // list of manual fields that must be filled (Aadhaar added)
    const requiredFields = [
      'firstName','lastName','age','gender','maritalStatus','email','phone',
      'highestEducation','occupation','annualIncome','currentLocation',
      'religion','community','caste','motherTongue',
      'familyType','siblings','heightCm','weightKg',
      'about','partnerPreferences','aadhaar'
    ]

    // If any required field is blank -> single general error
    const anyMissing = requiredFields.some(f => isBlank(form[f]))
    // Format checks
    const ageNum = Number(form.age)
    const ageInvalid = isBlank(form.age) || Number.isNaN(ageNum) || ageNum <= 0
    const emailInvalid = isBlank(form.email) || !looksLikeEmail(form.email)
    const phoneInvalid = isBlank(form.phone) || !looksLikePhone(form.phone)
    const heightInvalid = form.heightCm && isNaN(Number(form.heightCm))
    const weightInvalid = form.weightKg && isNaN(Number(form.weightKg))
    const aadhaarInvalid = isBlank(form.aadhaar) || !looksLikeAadhaar(form.aadhaar)
    const consentMissing = form.consentAadhaar !== true

    if (anyMissing || ageInvalid || emailInvalid || phoneInvalid || heightInvalid || weightInvalid || aadhaarInvalid || consentMissing) {
      // single unified message for manual mode
      errs.general = 'Kindly fill all necessary details.'
      // also add inline Aadhaar/consent errors for clarity
      if (aadhaarInvalid) errs.aadhaar = 'Enter a valid 12-digit Aadhaar number'
      if (consentMissing) errs.consentAadhaar = 'Consent for Aadhaar verification is required'
    }

    return errs
  }

  //  upload mode
  if (mode === 'upload') {
    if (!file && isBlank(form.profileLink)) errs.upload = 'Please upload a file or paste a profile link'
    if (!isBlank(form.profileLink) && !form.profileLink.startsWith('http')) errs.profileLink = 'Paste a valid link (starting with http)'
    if (isBlank(form.email)) errs.email = 'Email is required'
    else if (!looksLikeEmail(form.email)) errs.email = 'Enter a valid email'
    if (isBlank(form.phone)) errs.phone = 'Phone number is required'
    else if (!looksLikePhone(form.phone)) errs.phone = 'Enter a valid phone number'
    // Aadhaar checks in upload mode as well
    if (isBlank(form.aadhaar) || !looksLikeAadhaar(form.aadhaar)) errs.aadhaar = 'Enter a valid 12-digit Aadhaar number'
    if (form.consentAadhaar !== true) errs.consentAadhaar = 'Consent for Aadhaar verification is required'
  }

  return errs
}


  function handleSubmit(e){
    e.preventDefault()
    const v = validate()
    setErrors(v)
    console.log('handleSubmit validation errors:', v, 'mode:', mode, 'form:', form, 'file:', file)
    if (Object.keys(v).length) {
    if (v.general) setShowErrorPopup(true)
    return
}


    const payload = { ...form, file: file ? { name: file.name, size: file.size } : null, registeredAt: new Date().toISOString() }
    console.log('Registration payload:', payload)
    setSubmitted(true)
    setShowPopup(true)


    setTimeout(() => {
      setForm({
        firstName: '', lastName: '', age: '', gender: '', maritalStatus: '', email: '', phone: '',
        highestEducation: '', occupation: '', annualIncome: '', currentLocation: '',
        religion: '', community: '', caste: '', motherTongue: '',
        familyType: '', siblings: '', heightCm: '', weightKg: '', about: '', partnerPreferences: '',
        fileName: '', profileLink: '', aadhaar: '', consentAadhaar: false
      })
      setFile(null)
      setMode('upload')
      setSubmitted(false)
      setErrors({})
    }, 2200)
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
          <button className={mode==='upload'? 'active':''} onClick={()=>setMode('upload')}>Upload (File / Link)</button>
          <button className={mode==='manual'? 'active':''} onClick={()=>setMode('manual')}>Fill Manual</button>
        </div>

        <form onSubmit={handleSubmit} className="reg-form" noValidate>


          {/* UPLOAD panel */}
          {mode === 'upload' && (
            <>
              <label className="file-upload">Upload Profile File (PDF / Image)
                <input type="file" accept="image/*,application/pdf" onChange={handleFile} />
                {form.fileName && <div className="file-info">Selected: {form.fileName}</div>}
              </label>

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

              {/* Aadhaar fields added here for upload mode */}
              <label>Aadhaar Number *
                <input name="aadhaar" value={form.aadhaar} onChange={handleChange} placeholder="12-digit Aadhaar number" />
                {errors.aadhaar && <small className="err">{errors.aadhaar}</small>}
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  name="consentAadhaar"
                  checked={!!form.consentAadhaar}
                  onChange={handleChange}
                />
                <span>I consent to Aadhaar verification (required)</span>
              </label>
              {errors.consentAadhaar && <small className="err">{errors.consentAadhaar}</small>}

            </>
          )}

          {/* MANUAL panel */}
          {mode === 'manual' && (
            <>
            <div className='pink-box'>
              <h3>Personal information</h3>
              <div className="flex-row">
                <label>First name *
                  <input name="firstName" value={form.firstName} onChange={handleChange} />
                  {errors.firstName && <small className="err">{errors.firstName}</small>}
                </label>

                <label>Last name
                  <input name="lastName" value={form.lastName} onChange={handleChange} />
                  {errors.lastName && <small className="err">{errors.lastName}</small>}
                </label>
              </div>

              <div className="flex-row">
                <label>Age *
                  <input name="age" value={form.age} onChange={handleChange} type="number" min="18" />
                  {errors.age && <small className="err">{errors.age}</small>}
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
                    <option>Seperated</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                  {errors.maritalStatus && <small className="err">{errors.maritalStatus}</small>}
                </label>
              </div>

              <div className="flex-row">
                <label>Email *
                  <input name="email" value={form.email} onChange={handleChange} />
                  {errors.email && <small className="err">{errors.email}</small>}
                </label>

                <label>Phone *
                  <input name="phone" value={form.phone} onChange={handleChange} />
                  {errors.phone && <small className="err">{errors.phone}</small>}
                </label>
              </div>
            </div>
            <div className='pink-box'>
              <h3>Education and career</h3>
              <label>Highest Education *
                <input name="highestEducation" value={form.highestEducation} onChange={handleChange} />
              </label>

              <label>Occupation
                <input name="occupation" value={form.occupation} onChange={handleChange} />
              </label>

              <div className="flex-row">
                <label>Annual Income *
                  <input name="annualIncome" value={form.annualIncome} onChange={handleChange} />
                </label>

                <label>Current Location 
                  <input name="currentLocation" value={form.currentLocation} onChange={handleChange} />
                  {errors.currentLocation && <small className="err">{errors.currentLocation}</small>}
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
              <input
                name="hobbies"
                value={form.hobbies || ''}
                onChange={handleChange}
                style={{ fontFamily: 'inherit', fontSize: '14px', color: '#333' }}
              />
            </label>

            <div style={{ height: 20 }} />
              <label>About Me - Tell about yourself
                <textarea name="about" value={form.about} onChange={handleChange} rows={4}   style={{ fontFamily: 'inherit', fontSize: '14px', color: '#333' }}/>
              </label>

              
              <div style={{ height: 20 }} />

              <label>Partner preferences
                <textarea name="partnerPreferences" value={form.partnerPreferences} onChange={handleChange} rows={3} style={{ fontFamily: 'inherit', fontSize: '14px', color: '#333', }} />
              </label>
            </div>

            {/* Aadhaar fields added in manual panel near the bottom to avoid UI shifts */}
            <div style={{ marginTop: 8 }}>
              <label>Aadhaar Number *
                <input name="aadhaar" value={form.aadhaar} onChange={handleChange} placeholder="12-digit Aadhaar number" />
                {errors.aadhaar && <small className="err">{errors.aadhaar}</small>}
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  name="consentAadhaar"
                  checked={!!form.consentAadhaar}
                  onChange={handleChange}
                />
                <span>I consent to Aadhaar verification (required)</span>
              </label>
              {errors.consentAadhaar && <small className="err">{errors.consentAadhaar}</small>}
            </div>

            </>
          )}

          <div className="actions">
            <button type="submit">Register</button>
            <button type="button" className="secondary" onClick={() => { setForm({ firstName: '', lastName: '', age: '', gender: '', maritalStatus: '', email: '', phone: '', highestEducation: '', occupation: '', annualIncome: '', currentLocation: '', religion: '', community: '', caste: '', motherTongue: '', familyType: '', siblings: '', heightCm: '', weightKg: '', about: '', partnerPreferences: '', fileName: '', profileLink: '', aadhaar: '', consentAadhaar: false }); setFile(null) }}>Reset</button>
          </div>

    
        </form>

        {mode === 'upload' && (
      <aside className="help">
    <img 
      src="src/assets/Matrimony.jpg" 
      alt="Perfect Match Illustration" 
      style={{ width: '100%', borderRadius: '10px' , height: '100%'}} 
    />
  </aside>
)}
{showPopup && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }}>
    <div style={{
      background: 'white',
      border: '#db2777',
      borderRadius: '10px',
      padding: '30px',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    }}>
      <h2 style={{ color: '#db2777', marginBottom: '20px' }}>Registration Successful</h2>
      <button 
        onClick={() => setShowPopup(false)} 
        style={{
          backgroundColor: '#db2777',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        OK
      </button>
    </div>
  </div>
)}

{showErrorPopup && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }}>
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '30px',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      border: '24px #8b0000'
    }}>
      <h3 style={{ color: '#8b0000', marginBottom: '10px' }}>
        Kindly fill all necessary details
      </h3>
      <button
        onClick={() => setShowErrorPopup(false)}
        style={{
          backgroundColor: '#8b0000',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        OK
      </button>
    </div>
  </div>
)}


      </section>

      <footer className="reg-footer">© {new Date().getFullYear()} HeavenMatch</footer>
    </div>
  )
}
