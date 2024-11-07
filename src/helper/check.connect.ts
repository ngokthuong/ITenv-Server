import mongoose from "mongoose"
export const countConnect = () => {
    const numberConnect = mongoose.connect.length
    console.log(`Number of connections: ${numberConnect}`)
}
