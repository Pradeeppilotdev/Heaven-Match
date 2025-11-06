import React from 'react'
import { Outlet } from 'react-router-dom'


export default function App() {
return (
<div style={{ fontFamily: 'Arial, sans-serif', padding: 24 }}>
<h1>MFA Login Demo</h1>
<Outlet />
</div>
)
}