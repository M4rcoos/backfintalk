
const jtw = require('jsonwebtoken')
const User = require('../models/User')
const bcrypt = require('bcrypt')

const login = async (req,res)=>{
    const { email, password} = req.body

    const userExist = await User.findOne({email: email})

    if(!userExist){
        res.status(422).json({ msg: "Usuario não existe!" })
        return
    }


    if (!email) {
       res.status(422).json({ msg: "O email é Obrigatório!" })
       return
   }
   if (!password) {
       res.status(422).json({ msg: "A senha é Obrigatório!" })
       return
   }
   //user exist
   const user = await User.findOne({email: email})
   
   if(!user){
       res.status(404).json({ msg: "Usuário não encontrado" })
       return
   }
   //check password
   const checkPass = await bcrypt.compare(password, user.password)
   
   if(!checkPass){
       res.status(422).json({ msg: "Senha inválida!" })
       return
   }
   try {
       const secret = "SK125AXMZK"
       const token = jtw.sign({
           id: user._id,
           name: user.name
       },
        secret,
       )
       res.status(200).json({ msg: "Sucess", id:user._id,user: user.name, token })
   
   } catch (error) {
       res.status(500).json({msg:`Erro no servidor:${error}`})
   }
   
}
const register = async (req, res)=>{
    const { name, email, password, confirmPassword } = req.body

    if (!name) {
        res.status(422).json({ msg: "O nome é Obrigatório!" })
        return
    }
    if (!email) {
        res.status(422).json({ msg: "O email é Obrigatório!" })
        return
    }
    if (!password) {
        res.status(422).json({ msg: "A senha é Obrigatório!" })
        return
    }
    if (password !== confirmPassword) {
        res.status(422).json({ msg: "As senhas não estão iguais!" })
        return
    }


    //check if user exist

    const userExist = await User.findOne({email: email})

    if(userExist){
        res.status(422).json({ msg: "Email já existe!" })
        return
    }


    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({
        name,email,password:passwordHash
    })
    
    try {
        await user.save()
        res.status(201).json({ msg: "Usuário criado com sucesso!" })

    } catch (error) {
        res.status(500).json({msg:`Erro no servidor:${error}`})
    }
}
module.exports = {
  login,
  register
}