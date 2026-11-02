export const successResponse = (data: unknown, message = "success") => ({
    success: true,
    message,
    data
})

export const errorResponse = (message: string, code = 400) => ({
    success: false,
    message,
    code
})

export const formatDbError = (err: any): string => {
    console.error('Server/DB Error:', err)
    const msg = typeof err === 'string' ? err : err?.message || ''
    if (
        msg.includes('Failed query') ||
        msg.includes('syntax error') ||
        msg.includes('violates') ||
        msg.includes('relation') ||
        msg.includes('column') ||
        msg.includes('insert into') ||
        msg.includes('select') ||
        msg.includes('update') ||
        msg.includes('delete from') ||
        msg.includes('postgres') ||
        msg.includes('NeonDbError')
    ) {
        return 'Terjadi kesalahan pada database server'
    }
    return msg || 'Terjadi kesalahan internal pada server'
}
