import { useId, useState, useSyncExternalStore } from 'react'
import { Alert, Button, Form, Input, Space } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSession, subscribeSession } from '@/shared/api/session'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { inputSchema, type Operation } from '../api/operations'
import { useOperation } from '../hooks/use-operation'

export function OperationForm({
  operation,
  token = '',
}: {
  operation: Operation
  token?: string
}) {
  const id = useId()
  const session = useSyncExternalStore(subscribeSession, getSession)
  const [result, setResult] = useState<unknown>(undefined)
  const mutation = useOperation(operation)
  const {
    control,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<Record<string, string>>({
    resolver: zodResolver(inputSchema(operation)),
    defaultValues: Object.fromEntries(
      operation.fields.map((f) => [
        f.key,
        f.key === 'token' ? token : (f.initial ?? ''),
      ]),
    ),
  })
  async function submit(values: Record<string, string>) {
    setResult(undefined)
    try {
      const response = await mutation.mutateAsync(values)
      setResult(response)
      operation.fields
        .filter((f) => f.secret)
        .forEach((f) => resetField(f.key, { defaultValue: '' }))
    } catch (error) {
      applyApiFieldErrors(
        error,
        setError,
        operation.fields.map((f) => f.key),
      )
    }
  }
  return (
    <section aria-labelledby={id + '-title'}>
      <h2 id={id + '-title'}>{operation.title}</h2>
      {operation.authenticated && !session && (
        <Alert
          type="warning"
          showIcon
          title="Đăng nhập trước khi thực hiện thao tác này."
        />
      )}
      <Form
        layout="vertical"
        onSubmitCapture={handleSubmit(submit)}
        style={{ maxWidth: 640, marginTop: 24 }}
      >
        {operation.fields.map((field) => (
          <Form.Item
            key={field.key}
            label={field.label}
            htmlFor={id + field.key}
            validateStatus={errors[field.key] ? 'error' : undefined}
            help={errors[field.key]?.message}
          >
            <Controller
              name={field.key}
              control={control}
              render={({ field: input }) =>
                field.secret ? (
                  <Input.Password
                    {...input}
                    id={id + field.key}
                    autoComplete={
                      field.key === 'password'
                        ? 'current-password'
                        : 'new-password'
                    }
                  />
                ) : (
                  <Input
                    {...input}
                    id={id + field.key}
                    autoComplete={field.key === 'email' ? 'email' : 'off'}
                  />
                )
              }
            />
          </Form.Item>
        ))}
        <Space wrap>
          <Button
            htmlType="submit"
            type="primary"
            danger={operation.method === 'DELETE'}
            loading={mutation.isPending}
            disabled={operation.authenticated && !session}
          >
            {operation.title}
          </Button>
        </Space>
      </Form>
      {mutation.isError && (
        <Alert
          style={{ marginTop: 20 }}
          type="error"
          showIcon
          title={errorMessage(mutation.error)}
          description={
            mutation.error instanceof ApiError
              ? [
                  mutation.error.status || '',
                  mutation.error.code,
                  mutation.error.traceId,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : undefined
          }
        />
      )}
      {mutation.isSuccess && (
        <Alert
          style={{ marginTop: 20 }}
          type="success"
          showIcon
          title={operation.success ?? 'Thao tác thành công.'}
        />
      )}
      {result !== undefined && (
        <section aria-label="Kết quả từ máy chủ" style={{ marginTop: 24 }}>
          <h3>Kết quả từ máy chủ</h3>
          {result === null ? (
            <p>Yêu cầu đã hoàn tất.</p>
          ) : (
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                maxHeight: 480,
                overflow: 'auto',
                padding: 16,
                background: '#F3EFE6',
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </section>
      )}
    </section>
  )
}
