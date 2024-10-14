
import {bitable, ITable, ITextField} from "@lark-base-open/js-sdk";




export default async function getTable(id: string) {
    const table:ITable = await bitable.base.getTable(id)
    const recordIdList = await table.getRecordIdList();
    const field1 = await table.getFieldByName<ITextField>('文本');
    const field2 = await table.getFieldByName<ITextField>('经纬度');
    const jsonArrary = []

    for (const recordId of recordIdList) {
        const currentVal = await field1.getValue(recordId);
        const currentVal2 = await field2.getValue(recordId);
        //currentVal2.text , 分割
        const arr = currentVal2[0].text.split(',')
        jsonArrary.push({
          name: currentVal[0].text,
            longitude: arr[0],
            latitude: arr[1]
        })
        // await currencyField.setValue(recordId, currentVal * ratio);
    }
    return jsonArrary
}




function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径，单位：公里
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function findClosestLocation(text, locations) {

    let currentLon  = text.split(',')[0]
    let currentLat = text.split(',')[1]
    let closestLocation = null;
    let shortestDistance = Infinity;

    locations.forEach(location => {
        const distance = getDistance(currentLat, currentLon, location.latitude, location.longitude);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            closestLocation = location;
        }
    });

    return closestLocation.name;
}

