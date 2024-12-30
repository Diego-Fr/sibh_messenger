const axios = require('axios')
const moment = require('moment')

const getAlertFromStation = async (station_prefix_id, current_date, current_state) =>{
    
    return 'testando'
}

const insertAlert = async (station_prefix_id, current_date, current_state) =>{
    await axios({
        method: 'post',
        url: `https://cth.daee.sp.gov.br/sibh/api/v2/alerts/new`,
        data:{
            date_hour: moment(current_date).format('YYYY-MM-DD HH:mm'),
            flag: current_state,
            alert_type_id: 1,
            alertable_type: 'StationPrefix',
            alertable_id: parseInt(station_prefix_id)
        }
    }).then(data=>{
        console.log('Alerta criado');
    }).catch(e=>{
        console.log('Erro ao salvar alerta', e);
    })

    return true
}

const getStationAlerts = async station_prefix_id =>{
    let response = await axios({
        method: 'GET',
        url: `https://cth.daee.sp.gov.br/sibh/api/v2/alerts?alertable_type=StationPrefix&alertable_id=${station_prefix_id}`
    })
    
    return response?.data
}

module.exports = {
    getAlertFromStation,insertAlert,getStationAlerts
}