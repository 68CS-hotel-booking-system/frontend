interface GoogleIdentity {
  initialize(config: {
    client_id: string
    nonce: string
    context: 'signin' | 'signup'
    callback: (response: { credential: string }) => void
  }): void
  renderButton(parent: HTMLElement, options: {
    text: 'signin_with' | 'signup_with'
    size: 'large'
    width: number
    locale: 'vi'
  }): void
}

function loadedIdentity() {
  return (window as Window & { google?: { accounts?: { id?: GoogleIdentity } } }).google?.accounts?.id
}

let loading: Promise<GoogleIdentity> | undefined

export function loadGoogleIdentity() {
  const ready = loadedIdentity()
  if (ready) return Promise.resolve(ready)
  loading ??= new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement('script')
    const timeout = window.setTimeout(fail, 12000)
    function fail() {
      window.clearTimeout(timeout)
      script.remove()
      reject(new Error('Không tải được nút Google.'))
    }
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onerror = fail
    script.onload = () => {
      const identity = loadedIdentity()
      if (!identity) return fail()
      window.clearTimeout(timeout)
      resolve(identity)
    }
    document.head.append(script)
  }).catch((error: unknown) => {
    loading = undefined
    throw error
  })
  return loading
}
