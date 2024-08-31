import createError from 'http-errors'

export const badRequest = (err: string, respond: any) => {
    const error = createError.BadRequest(err);
    return respond.status(error.status).json({
        err: 1,
        mes: error.message
    });
}

// export const interalServerError = (req, resp) => {
//     const error = createError.InternalServerError()
//     return resp.status(error.status).json({
//         err: 1,
//         mes: error.message
//     })
// }

// export const notFound = (req, resp) => {
//     const error = createError.NotFound('This route is not defined')
//     return resp.status(error.status).json({
//         err: 1,
//         mes: error.message
//     })
// }

// export const notAuth = (err, resp, isExpire) => {
//     const error = createError.Unauthorized(err)
//     return resp.status(error.status).json({
//         // isExpire ( da het han ) thi tra ve loi 2 va nguoc lai
//         // 2 là lỗi chung liên quan đến việc hết hạn
//         // 1 Chỉ định những loại lỗi khác
//         err: isExpire ? 2 : 1,
//         mes: error.message
//     })
// }