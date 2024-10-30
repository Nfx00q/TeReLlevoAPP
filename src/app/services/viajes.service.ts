import { Injectable } from '@angular/core';
import { Viajes } from '../interfaces/viajes';
import { from, map, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class ViajesService {

  private viajesCollection = this.firestore.collection<Viajes>('viajes');

  constructor(private firestore: AngularFirestore) {}

  crearViaje(viaje: Viajes): Observable<string> {
    const viajeRef = this.firestore.collection('viajes').add(viaje);
    return from(viajeRef).pipe(
      map((docRef) => docRef.id)  // Retorna el UID del documento creado
    );
  }

  // Obtener un viaje por código
  obtenerViajePorCodigo(codigo: string): Observable<Viajes | undefined> {
    return this.viajesCollection.doc<Viajes>(codigo).valueChanges();
  }

  // Actualizar un viaje
  actualizarViaje(codigo: string, viaje: Partial<Viajes>): Promise<void> {
    return this.viajesCollection.doc(codigo).update(viaje);
  }

  // Eliminar un viaje
  eliminarViaje(codigo: string): Promise<void> {
    return this.viajesCollection.doc(codigo).delete();
  }

  // Generar un código único
  generarCodigoUnico(): string {
    return this.firestore.createId();
  }
  
}
