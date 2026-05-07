import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCompanies } from '@/hooks/useCompanies'
import { useCateringClients } from '@/hooks/useCateringClients'
import { useCreatePayment } from '@/hooks/usePayments'
import {
  PAYMENT_METHODS,
  type PaymentMethod,
  type PaymentRecipientType,
} from '@/types/payment.types'
import { formatCurrency } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-errors'

type RecipientPreset =
  | { type: 'company'; id: string; name: string }
  | { type: 'client'; id: string; name: string }
  | null

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Pre-selected recipient. When set, the recipient pickers are hidden and the
   * dialog records a payment for that exact entity. When null, the user picks
   * a recipient type (company / client) and an entity from a dropdown.
   */
  preset?: RecipientPreset
}

export default function RecordPaymentDialog({
  open,
  onOpenChange,
  preset = null,
}: Props) {
  const isPreset = preset !== null
  const presetType = preset?.type ?? null

  // Picker state — only used when no preset is provided.
  const [recipientType, setRecipientType] = useState<PaymentRecipientType>(
    presetType ?? 'company',
  )
  const [companyId, setCompanyId] = useState('')
  const [clientId, setClientId] = useState('')

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [paidAt, setPaidAt] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [note, setNote] = useState('')

  const { data: companies } = useCompanies()
  const { data: clients } = useCateringClients()
  const createMutation = useCreatePayment()

  const activeCompanies = companies?.filter((c) => c.status === 'active') ?? []
  const activeClients = clients ?? []

  // Reset form whenever the dialog opens.
  useEffect(() => {
    if (!open) return
    setRecipientType(presetType ?? 'company')
    setCompanyId('')
    setClientId('')
    setAmount('')
    setMethod('cash')
    setPaidAt(format(new Date(), 'yyyy-MM-dd'))
    setNote('')
  }, [open, presetType])

  const numericAmount = parseFloat(amount)
  const recipientReady = isPreset
    ? true
    : recipientType === 'company'
      ? !!companyId
      : !!clientId

  const canSubmit =
    recipientReady &&
    !!paidAt &&
    Number.isFinite(numericAmount) &&
    numericAmount > 0 &&
    !createMutation.isPending

  async function handleSubmit() {
    if (!canSubmit) return
    const payload: Parameters<typeof createMutation.mutateAsync>[0] = {
      amount: numericAmount,
      method,
      paidAt,
      note: note.trim() || undefined,
    }
    if (isPreset) {
      if (preset!.type === 'company') payload.companyId = preset!.id
      else payload.cateringClientId = preset!.id
    } else if (recipientType === 'company') {
      payload.companyId = companyId
    } else {
      payload.cateringClientId = clientId
    }

    try {
      await createMutation.mutateAsync(payload)
      toast.success('Payment recorded')
      onOpenChange(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to record payment'))
    }
  }

  const presetTypeLabel =
    preset?.type === 'company' ? 'company' : preset?.type === 'client' ? 'client' : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isPreset ? `Record Payment — ${preset!.name}` : 'Record Payment'}
          </DialogTitle>
          <DialogDescription>
            {isPreset
              ? `Record a payment received from this ${presetTypeLabel}. Amounts are in UZS.`
              : 'Record a payment received from a company or client. Amounts are in UZS.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isPreset && (
            <>
              <div className="space-y-2">
                <Label>Recipient type</Label>
                <Select
                  value={recipientType}
                  onValueChange={(v) => {
                    setRecipientType(v as PaymentRecipientType)
                    setCompanyId('')
                    setClientId('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recipientType === 'company' ? (
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select value={companyId} onValueChange={setCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCompanies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount (UZS)</Label>
              <Input
                type="number"
                step="1000"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {numericAmount > 0 && (
                <p className="text-xs text-gray-500">
                  {formatCurrency(numericAmount)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Paid At</Label>
              <DatePicker
                value={paidAt}
                onChange={setPaidAt}
                placeholder="Payment date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((m) => (
                  <SelectItem key={m} value={m}>
                    {PAYMENT_METHODS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reference number, invoice link, etc."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {createMutation.isPending ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
