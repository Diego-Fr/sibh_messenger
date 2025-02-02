const { default: axios } = require("axios")
const express = require('express');
require('dotenv').config()
const bodyParser = require('body-parser');
const {getAlertFromStation,insertAlert,getStationAlerts} = require('./models/alert')
const moment = require('moment')


const app = express()
const port = process.env.PORT
const PHONE_NUMBERS = process.env.PHONE_NUMBERS //nao existe api (ao menos n achei) melhorar isso futuramente


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/grafana_callback',(req, res)=>{
    
    let body = req.body

    if(body && body.receiver === 'SSSP - Alertas de Cotas'){
        //alerta de cota de referencia do grafana
        fluAlert(body)
    } else {
        res.send('Nada no body, nenhuma mensagem enviada')
    }

    res.send('ok')
    
})
app.listen(port, _=>{
    console.log('Server escutando a porta ' + port);
})


const fluAlert = async obj =>{
    let alerts = obj.alerts.filter(x=>x.status === 'firing') //tem outros status (como resolved), que nao serão analisados aqui

    for(let i = 0; i < alerts.length; i++){
        let alert = alerts[i]
        await start(alert.labels)
    }
    
}

async function start(labels){
    let phoneNumbers = PHONE_NUMBERS.split(',')
    console.log('enviando mensagem de alerta');
    console.log(labels);
    console.log(phoneNumbers)
    
    
    let {station_prefix_id, current_level, current_state, current_date, station_name, city_name, prefix} = labels


    let stationAlerts = []

    if(station_prefix_id && current_date){
        
        if(['Emergência', 'Extravasamento'].includes(current_state)){
        
            try{
                stationAlerts = await getStationAlerts(station_prefix_id) || stationAlerts
            } catch (e){
                console.log('Erro ao buscar alertas do posto ' + station_prefix_id)
            }

            await insertAlert(station_prefix_id, current_date, current_state)

            for(let i = 0; i < phoneNumbers.length; i++){
                let phoneNumber = phoneNumbers[i]
        
                    if(stationAlerts.length === 0 || 
                        stationAlerts.filter(
                            x=>moment(x.date_hour, 'YYYY-MM-DD HH:mm').isSame(moment(current_date, 'YYYY-MM-DD HH:mm').add(3, 'hours'))
                        ).length === 0
                    ) {
                        await axios({
                            method: 'post',
                            url: `https://graph.facebook.com/v21.0/${process.env.PHONE_ID}/messages`,
                            headers: {'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`},
                            data:{
                                messaging_product: 'whatsapp',
                                recipient_type: "individual",
                                to: phoneNumber,
                                type: 'template',
                                template:{
                                    name: current_state === 'Emergência' ? 'alerta_emergencia_new' : 'alerta_extravasamento_new', 
                                    language: {code: 'pt_BR'},
                                    components:[{
                                            type: 'body',
                                            parameters:[
                                                {
                                                    type: 'text',
                                                    text: station_name
                                                },
                                                {
                                                    type: 'text',
                                                    text: city_name
                                                },
                                                {
                                                    type: 'text',
                                                    text: current_date
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }).then(data=>{
                            console.log('Mensagem enviada');
                            console.log(`Número: ${phoneNumber}`);
                            
                        })
                    } else {
                        console.log('Alerta já enviado uma vez');
                    }
        
                    console.log('enviando mesnagem para o numero ', i, phoneNumber);
                
            }

        } else {
            console.log('não é emergencia ou extravasamento, ignorando esse alerta');
            
        }
    }
    
    
}



// start()