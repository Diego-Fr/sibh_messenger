const getAlertFromStation = async (station_prefix_id, current_date, current_state) =>{
    
    return 'testando'
}

const insertAlert = async (station_prefix_id, current_date, current_state) =>{
    await axios({
        method: 'post',
        url: `https://cth.daee.sp.gov.br/sibh/api/v2/alerts/new`,
        data:{
            date_hour: current_date,
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

module.exports = {
    getAlertFromStation,insertAlert
}