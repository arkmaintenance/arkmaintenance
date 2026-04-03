import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react'

export default function TrashPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader title="Trash" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Trash</h2>
            <p className="text-muted-foreground">
              Deleted items are kept for 6 months before permanent deletion.
            </p>
          </div>
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Empty Trash
          </Button>
        </div>

        {/* Warning */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-amber-500 font-medium">Retention Policy</p>
            <p className="text-sm text-muted-foreground">
              Items in trash will be automatically deleted after 6 months. Restore items before they are permanently removed.
            </p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Deleted Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Trash is empty.</p>
              <p className="text-sm mt-2">Deleted items will appear here.</p>
            </div>
          </CardContent>
        </Card>

        {/* Restore Info */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-[#00BFFF]/10 p-3">
                <RefreshCw className="h-6 w-6 text-[#00BFFF]" />
              </div>
              <div>
                <p className="font-medium text-foreground">Restore Items</p>
                <p className="text-sm text-muted-foreground">
                  Click on any deleted item to restore it back to its original location.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
