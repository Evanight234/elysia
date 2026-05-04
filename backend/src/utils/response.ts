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