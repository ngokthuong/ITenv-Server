import Account from "../model/account";


const registerService = async (data: any) => {
    // check xem đã có email này trong database chưa

    // Gửi OTP về email
    // JWT và refresh roken 
    // Băm mk và add vào database
    console.log(data)
    const account = await Account.create(data)
    return account
}
export { registerService }