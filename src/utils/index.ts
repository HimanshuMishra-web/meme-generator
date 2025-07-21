import {ASSETS_URL} from "../../constants";

const generateImageSource = (filepath :  String | null) =>{
    if(!filepath) return "";
    return `${ASSETS_URL}${filepath}`
}


export {
    generateImageSource
}