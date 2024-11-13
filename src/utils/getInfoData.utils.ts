import lodash from 'lodash'

const getInfoData = ({ fileds = [], object = {} }: any) => {
    return lodash.pick(object, fileds)
}

export { getInfoData }