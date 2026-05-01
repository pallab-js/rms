import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-8 w-[100px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-bg-surface border-border">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-bg-surface border-border">
            <CardHeader>
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent className="h-[250px]">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
          <Card className="bg-bg-surface border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-bg-surface border-border h-[400px]">
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-bg-surface border-border h-[300px]">
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
