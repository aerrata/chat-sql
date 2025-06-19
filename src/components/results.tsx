import { Config, Result, Unicorn } from '@/lib/types'
import { DynamicChart } from '@/components/dynamic-chart'
import { SkeletonCard } from '@/components/skeleton-card'
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Results = ({ results, columns, chartConfig }: { results: Result[]; columns: string[]; chartConfig: Config | null }) => {
  const formatColumnTitle = (title: string) => {
    return title
      .split('_')
      .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
      .join(' ')
  }

  const formatCellValue = (column: string, value: any) => {
    if (column.toLowerCase().includes('valuation')) {
      const parsedValue = parseFloat(value)
      if (isNaN(parsedValue)) {
        return ''
      }
      const formattedValue = parsedValue.toFixed(2)
      const trimmedValue = formattedValue.replace(/\.?0+$/, '')
      return `$${trimmedValue}B`
    }
    if (column.toLowerCase().includes('rate')) {
      const parsedValue = parseFloat(value)
      if (isNaN(parsedValue)) {
        return ''
      }
      const percentage = (parsedValue * 100).toFixed(2)
      return `${percentage}%`
    }
    if (value instanceof Date) {
      return value.toLocaleDateString()
    }
    return String(value)
  }

  return (
    <div className="flex-grow flex flex-col">
      <Tabs defaultValue="table" className="w-full flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="charts" disabled={Object.keys(results[0] || {}).length <= 1 || results.length < 2}>
            Chart
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="flex-grow">
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {formatColumnTitle(column)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((company, index) => (
                <TableRow key={index}>
                  {columns.map((column, cellIndex) => (
                    <TableCell key={cellIndex} className="px-6 py-2 whitespace-nowrap text-sm">
                      {formatCellValue(column, company[column as keyof Unicorn])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="charts" className="flex-grow overflow-auto">
          <div className="mt-4">{chartConfig && results.length > 0 ? <DynamicChart chartData={results} chartConfig={chartConfig} /> : <SkeletonCard />}</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
