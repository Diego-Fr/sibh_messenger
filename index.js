const { default: axios } = require("axios")
const express = require('express');
require('dotenv').config()
const bodyParser = require('body-parser');


const app = express()
const port = process.env.PORT
const PHONE_NUMBERS = process.env.PHONE_NUMBERS //nao existe api (ao menos n achei) melhorar isso futuramente


app.post('/grafana_callback',(req, res)=>{
    
    let body = req.body

    console.log(req)

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
    let {current_level, current_state, current_date, station_name, city_name} = labels

    for(let i = 0; i < PHONE_NUMBERS; i++){
        let phoneNumber = phone_numbers[i]
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
                    name: 'alerta_emergencia', 
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
                                text: current_state
                            },
                            {
                                type: 'text',
                                text: current_date
                            }
                        ]
                    }]
                }
            }
        }).then(data=>{
            console.log('Mensagem enviada');
            console.log(`Número: ${phoneNumber}`);
            
        })
    }
    
}



// start()