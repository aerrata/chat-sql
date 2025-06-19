import { Button } from './ui/button'
import { Input } from './ui/input'

export const Search = ({ handleSubmit, inputValue, setInputValue, submitted, handleClear }: { handleSubmit: () => Promise<void>; inputValue: string; setInputValue: React.Dispatch<React.SetStateAction<string>>; submitted: boolean; handleClear: () => void }) => {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await handleSubmit()
      }}
      className="mb-6"
    >
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Input type="text" placeholder="Ask about startup unicorns..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="h-10" />
        {submitted ? (
          <Button type="button" variant="outline" onClick={handleClear} className="h-10 w-full sm:w-auto">
            Clear
          </Button>
        ) : (
          <Button type="submit" className="h-10 w-full sm:w-auto">
            Ask
          </Button>
        )}
      </div>
    </form>
  )
}
