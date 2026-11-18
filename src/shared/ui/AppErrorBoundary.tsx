import { Component, type ReactNode } from 'react'
import { StatusMessage } from './StatusMessage'

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <StatusMessage
          title="Không thể mở trang"
          description="Trang gặp lỗi hiển thị. Bạn có thể tải lại để thử tiếp."
        >
          <button type="button" onClick={() => window.location.reload()}>Tải lại trang</button>
        </StatusMessage>
      )
    }
    return this.props.children
  }
}
