import { Categoria } from '../models/categorias.js'

const regexNombreCategoria = /^[A-Za-z\s]+$/;

export const crearCategoria = async (req, res) => {
    const {nombreCategoria, idUsuario} = req.body

    try{
        if(!nombreCategoria || !idUsuario){
            return res.status(400).json({ message: 'Todos los campos son obligatorios'})
        }

        if (!regexNombreCategoria.test(nombreCategoria)){
            return res.status(400).json({ message: 'El nombre solo debe contener letras'})
        }

        const categoriaNormalizada = nombreCategoria.trim().toLowerCase();
        const existeCategoria = await Categoria.findOne({ 
            where: { 
                nombreCategoria: categoriaNormalizada 
            }
        });

        if (existeCategoria) {
            return res.status(400).json({ message: 'La categoría ya está registrada.' });
            }

        const newCategoria = await Categoria.create({
            nombreCategoria: nombreCategoria.trim(),
            idUsuario
        })

        return res.status(201).json(newCategoria)

        }catch (error) {
        console.error('Error al crear categoria', error);
        return res.status(500).json({ message: 'Error interno del servidor'})
    }
}