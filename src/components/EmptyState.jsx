export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 border-2 border-dashed border-[#1E3A5F] rounded-xl">
      {Icon && <Icon size={48} className="text-[#475569] mb-4" />}
      <h3 className="text-base font-semibold text-[#94A3B8] mb-2 font-grotesk text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#475569] text-center max-w-xs">{description}</p>
      )}
    </div>
  )
}
