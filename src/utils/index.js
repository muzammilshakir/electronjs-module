import { promises as fsp } from 'fs';
import axios from "axios";

const path = require("path");

const downloadDir = "./public/Download";
const API_URL = "https://admag-server.herokuapp.com/api";

export const readFromBillboardFile = async () => {
    const billboardJSON = await fsp.readFile(path.join(downloadDir, 'billboardID.json'), 'utf-8');
    const billboardID = JSON.parse(billboardJSON).id;
    return billboardID;
}

export const writeToBillboardFile = async (id) => {
    const billboardData = { id: id };
    await fsp.writeFile(path.join(downloadDir, 'billboardID.json'), JSON.stringify(billboardData));
}

export const readFromDownloadFile = async () => {
    const downloadedJSON = await fsp.readFile(path.join(downloadDir, 'downloaded.json'), 'utf-8');
    const downloaded = JSON.parse(downloadedJSON);
    return downloaded;
}

export const writeToDownloadFile = async (data) => {
    await fsp.writeFile(path.join(downloadDir, 'downloaded.json'), JSON.stringify(data));
}

export const getBillboards = async () => {
    const billID = await readFromBillboardFile();
    if (billID !== "") {
        const res = await axios.get(`${API_URL}/billboard/${billID}`);
        // console.log(res) ;
        return res.data;
    }
    else {
        return {}
    }
}
export const addBillboard = async (data) => {
    const res = await axios.post(`${API_URL}/billboard/`, data);
    await writeToBillboardFile(res.data._id) ;
}    
export const addPulse = async (data) => {
    let res = await axios.post(`${API_URL}/pulse/`, data);
    console.log("Add Pulse: ", res);
}    

export const getAdvertisemnets = async () => {
    const res = await axios.get(`${API_URL}/advertisement/`);
    return res.data;
}


export const getSchedules = async () => {
    const billID = await readFromBillboardFile();
    console.log(billID) ;
    if (billID !== "") {
        const res = await axios.get(`${API_URL}/schedule/`);
        console.log(res.data) ;
        let sc = res.data.filter((d) => {
            return d.billboard._id === billID && d.order.isApproved === true ;
        });
        return sc;
    }
    else {
        return {}
    }
}