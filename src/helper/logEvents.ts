import fs from 'fs'
import path from 'path'
import format from 'date-fns'

const fileName = path.join(__dirname, '../Logs', 'logs.log');

export const logEvents = async (msg: any) => {
    const dateTime = `${format.format(new Date(), 'dd-MM-yyyy\tss:mm:HH')}`;
    const contentLog = `${dateTime}----${msg}\n`
    try {
        fs.promises.appendFile(fileName, contentLog)
    } catch (error) {
        console.error(error)
    }
}