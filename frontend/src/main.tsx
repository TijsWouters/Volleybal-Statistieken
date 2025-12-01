import ReactDOM from 'react-dom/client'
import Root from './App'
import { StyledEngineProvider } from '@mui/material/styles'
import { GlobalStyles } from '@mui/styled-engine'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StyledEngineProvider enableCssLayer>
    <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
    <Root />
  </StyledEngineProvider>,
)
