import share from "../models/share"




export const deletePostSharedService = async (_id: string) => {
    try {
        return await share.findByIdAndUpdate(_id, { isDeleted: true }, { new: true })
    } catch (error: any) {
        throw new Error(error.message)
    }
}