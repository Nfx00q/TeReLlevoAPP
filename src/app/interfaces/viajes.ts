export interface Viajes {
    codigo?: string;
    nom_destino?: string;
    nom_inicio?: string;
    inicio?: string;
    final?: string;
    fecha?: string; 
    coordenada?: string;
    coordenada_destino?: string;

    driverName?: string; // Agregar este campo
    driverRut?: string;   // Agregar más campos si es necesario
    driverImg?: string;   // Por ejemplo, imagen del conductor
}