import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { AppProviders } from './app/providers/AppProviders'
import { env } from './shared/config/env'
import 'antd/dist/reset.css'
import './shared/styles/fonts.css'
import './shared/styles/global.css'
import './shared/styles/stayvibe.css'

document.title = env.appName
const root = document.getElementById('root')
if (!root) throw new Error('Không tìm thấy phần tử root.')

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
