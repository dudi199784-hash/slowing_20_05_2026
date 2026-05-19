export default function ChatbotWindy() {

  const container =
    "fixed bottom-6 right-6 z-50"

const button =
  `w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg 
   hover:scale-110 hover:shadow-xl active:scale-95
   transition-all duration-300 ease-out`

  const text =
    "text-sm font-semibold text-gray-800"

  return (
    <div className={container}>
      <div className={button}>
        <span className={text}>windy</span>
      </div>
    </div>
  )
}