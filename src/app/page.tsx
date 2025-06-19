'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateChartConfig, generateQuery, runGenerateSQLQuery } from './actions'
import { Config, Result } from '@/lib/types'
import { LoaderIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Results } from '@/components/results'
import { SuggestedQueries } from '@/components/suggested-queries'
import { QueryViewer } from '@/components/query-viewer'
import { Search } from '@/components/search'
import { Header } from '@/components/header'

export default function Page() {
  const [inputValue, setInputValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [activeQuery, setActiveQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(1)
  const [chartConfig, setChartConfig] = useState<Config | null>(null)

  const handleSubmit = async (suggestion?: string) => {
    const question = suggestion ?? inputValue
    if (inputValue.length === 0 && !suggestion) return
    clearExistingData()
    if (question.trim()) {
      setSubmitted(true)
    }
    setLoading(true)
    setLoadingStep(1)
    setActiveQuery('')
    try {
      const query = await generateQuery(question)
      if (query === undefined) {
        toast.error('An error occurred. Please try again.')
        setLoading(false)
        return
      }
      setActiveQuery(query)
      setLoadingStep(2)
      const companies = await runGenerateSQLQuery(query)
      const columns = companies.length > 0 ? Object.keys(companies[0]) : []
      setResults(companies)
      setColumns(columns)
      setLoading(false)
      const generation = await generateChartConfig(companies, question)
      setChartConfig(generation.config)
    } catch (e) {
      toast.error('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue(suggestion)
    try {
      await handleSubmit(suggestion)
    } catch (e) {
      toast.error('An error occurred. Please try again.')
    }
  }

  const clearExistingData = () => {
    setActiveQuery('')
    setResults([])
    setColumns([])
    setChartConfig(null)
  }

  const handleClear = () => {
    setSubmitted(false)
    setInputValue('')
    clearExistingData()
  }

  return (
    <div className="flex items-start justify-center p-0 sm:p-10">
      <div className="w-full max-w-4xl min-h-dvh sm:min-h-0 flex flex-col">
        <motion.div className="flex-grow flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <div className="p-4 sm:p-0 flex flex-col flex-grow">
            <Header />
            <Search handleClear={handleClear} handleSubmit={handleSubmit} inputValue={inputValue} setInputValue={setInputValue} submitted={submitted} />
            <div className="flex-grow flex flex-col sm:min-h-[420px]">
              <div className="flex-grow h-full">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <SuggestedQueries handleSuggestionClick={handleSuggestionClick} />
                  ) : (
                    <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} layout className="sm:h-full min-h-[400px] flex flex-col">
                      {activeQuery.length > 0 && <QueryViewer activeQuery={activeQuery} inputValue={inputValue} />}
                      {loading ? (
                        <div className="flex flex-grow items-center justify-center space-x-2 text-muted-foreground">
                          <LoaderIcon className="size-5 animate-spin" />
                          <p className="text-center">{loadingStep === 1 ? 'Generating SQL query...' : 'Running SQL query...'}</p>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="flex flex-grow items-center justify-center text-muted-foreground">
                          <p className="text-center">No results found.</p>
                        </div>
                      ) : (
                        <Results results={results} chartConfig={chartConfig} columns={columns} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
