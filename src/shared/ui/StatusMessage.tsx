import type { ReactNode } from 'react'
import '@/shared/styles/status-message.css'

interface StatusMessageProps {
  title: string
  description: string
  children?: ReactNode
  headingLevel?: 1 | 2
}

export function StatusMessage({ title, description, children, headingLevel = 1 }: StatusMessageProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  return <section className="status-message">
    <Heading>{title}</Heading>
    <p>{description}</p>
    {children && <div className="status-message-actions">{children}</div>}
  </section>
}
