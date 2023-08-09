import { tv } from 'tailwind-variants'

const box = tv({
    base: 'mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1 mx-4',
    variants: {
        borderColor: {
            normal: 'border-slate-300',
            error: 'border-red-500',
            success: 'border-green-500',
        },
        defaultVarients: {
            borderColor: 'normal',
        }
    }
})

export default box
