import { Categoria } from '../models/categorias.js'

const regexNombreCategoria = /^[A-Za-z\s]+$/;

export const obtenerCategorias = async (req, res) => {
    const { idUsuario } = req.params;

    if (!idUsuario) {
        return res.status(400).json({ message: 'El idUsuario es obligatorio.' });
    }

    try {
        const categorias = await Categoria.findAll({
            where: { idUsuario }
        });

        if (categorias.length === 0) {
            return res.status(404).json({ message: 'No se encontraron categorías para este usuario.' });
        }

        return res.status(200).json(categorias);

    } catch (error) {
        console.error('Error al obtener categorías:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const crearCategoria = async (req, res) => {
    const { nombreCategoria, idUsuario } = req.body;

    try {
        if (!nombreCategoria || !idUsuario) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Validación de formato del nombre de la categoría
        if (!regexNombreCategoria.test(nombreCategoria)) {
            return res.status(400).json({ message: 'El nombre solo debe contener letras' });
        }

        // Normalizar el nombre de la categoría
        const categoriaNormalizada = nombreCategoria.trim().toLowerCase();  // Asegúrate de que esté en minúsculas

        // Verificar si ya existe una categoría con el mismo nombre y usuario
        const existeCategoria = await Categoria.findOne({ 
            where: { 
                nombreCategoria: categoriaNormalizada,  // Usamos la versión normalizada
                idUsuario
            }
        });

        console.log(existeCategoria)

        if (existeCategoria) {
            return res.status(400).json({ message: 'Ya tienes esta categoría registrada.' });
        }

        // Crear la nueva categoría
        const newCategoria = await Categoria.create({
            nombreCategoria: categoriaNormalizada,  // Guardamos el nombre normalizado
            idUsuario
        });

        return res.status(201).json(newCategoria);

    } catch (error) {
        console.error('Error al crear categoría', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const actualizarCategoria = async (req, res) => {
    const { idUsuario, idCategoria } = req.params;
    const { nombreCategoria } = req.body;


    console.log('Datos recibidos:', req.body);
    console.log('Params:', req.params);
    
    try {
        
        if (!idUsuario || !idCategoria || !nombreCategoria) {
            return res.status(400).json({ message: 'El idUsuario, idCategoria y nombreCategoria son obligatorios.' });
        }

        // Normalizamos el nombre de la categoría
        const categoriaNormalizada = nombreCategoria.trim().toLowerCase();

        // Verificamos si ya existe una categoría con ese nombre para el mismo usuario
        const existeCategoria = await Categoria.findOne({
            where: {
                nombreCategoria: categoriaNormalizada,
                idUsuario,
            },
        });

        if (existeCategoria && existeCategoria.idCategoria !== idCategoria) {
            return res.status(400).json({ message: 'Ya tienes una categoría con ese nombre.' });
        }

        const categoria = await Categoria.findOne({
            where: { idUsuario, idCategoria: idCategoria }
        });

        if (!categoria) {
            return res.status(404).json({ message: 'Categoría no encontrada o no pertenece a este usuario.' });
        }

        categoria.nombreCategoria = nombreCategoria.trim();

        await categoria.save();

        return res.status(200).json({ message: 'Categoría actualizada con éxito.', categoria });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const eliminarCategoria = async (req, res) => {
    const { idUsuario, idCategoria } = req.params;

    try {
        if (!idUsuario || !idCategoria) {
            return res.status(400).json({ message: 'El idUsuario y idCategoria son obligatorios' });
        }

        const categoria = await Categoria.findOne({
            where: {
                idCategoria: idCategoria,
                idUsuario: idUsuario
            }
        });

        if (!categoria) {
            return res.status(404).json({ message: 'Categoría no encontrada o no pertenece a este usuario' });
        }

        await categoria.destroy();

        return res.status(200).json({ message: 'Categoría eliminada correctamente' });

    } catch (error) {
        console.error('Error al eliminar categoría', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};