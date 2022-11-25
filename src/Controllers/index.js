const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const loginUser = async (req, res) => {

    try {
        const {body} = req;
    
        // Destructuring cardNumber and PIN from body, and renaming it.
        // Both come from frontend
        const {cardNumber: cardNumberReq, NIP: NIPReq} = body;

        // Validating if user didn't send empty fields
        if(cardNumberReq && NIPReq) {
            
            // Searching for cardNumberReq in DB
            const findCardUser = await prisma.Tarjeta.findUnique({
                where: {
                    num_tarjeta: cardNumberReq,
                },
            });
            
            // If not found, it is send that either cardNumber or NIP is wrong
            if (!findCardUser) {
                res.send({
                    shouldLogin: false,
                });
            } else {
                // Also checking that sent NIP is correct
                // if it is, with authorize login and send
                // id and type of the card, necesary for
                // correct operation of ATM
                if (findCardUser.NIP === NIPReq) {
                    res.send({
                        shouldLogin: true,
                        idCuenta: findCardUser.id_cuenta,
                        tipoTarjeta: findCardUser.tipo_tarjeta
                    });
                } else {
                    // If not, it is send that either cardNumber or NIP is wrong
                    res.send({
                        shouldLogin: false,
                    }); 
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const getUserData = async (req, res) => {
    try {
        const {body} = req;
        const {cardNumber: cardNumberReq, idAccount: idAccountReq} = body;

        // Getting card end date from the card used for login
        const findCardDate = await prisma.Tarjeta.findUnique({
            where: {
                num_tarjeta: cardNumberReq,
            },
            select: {
                fecha_vencimiento: true,
            },
        });

        // Getting user info from accountID, we can grab data from relations
        // using the follwing prisma query Sintax
        const findUserInfo = await prisma.Cuenta.findUnique({
            where: {
                id_cuenta: idAccountReq,
            },
            select: {
                fondos: true,
                Cliente: {
                    select: {
                        nombre: true,
                        apellido: true,
                    },
                },
            },
        });
        
        // Validating if both queries throw something
        if(findUserInfo && findCardDate) {
            // Sending info to frontend
            let cardDateEnd = new Date(findCardDate.fecha_vencimiento);
            cardDateEnd = `${cardDateEnd.getMonth()}/${cardDateEnd.getFullYear()}`;
            res.send({
                fonds: findUserInfo.fondos,
                name: `${findUserInfo.Cliente.nombre} ${findUserInfo.Cliente.apellido}`,
                cardDateEnd,
                dataFounded: true,
            })
        } else {
            // Data not founded
            res.status(404).send({
                dataFounded: false,
            })
        }

    } catch (error) {
        console.log(error);
    }
    
};


module.exports = {
    loginUser,
    getUserData,
}