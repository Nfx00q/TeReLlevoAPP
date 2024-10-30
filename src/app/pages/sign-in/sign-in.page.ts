import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuController, ToastController } from '@ionic/angular';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

  /* ----- Definición de FORMULARIO REGISTRO ----- */

  registerForm: FormGroup;

  /* ----- DEFINICION DE VARIABLES ------ */

  emailValue : string = ' ';
  passValue : string = ' ';
  nombreValue : string = ' ';
  apellidoValue : string = ' ';
  tipoCuenta: string = '';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder, 
    private toastController: ToastController,
    private authService: AuthServiceService,
    private menuController: MenuController,
    private firestore: AngularFirestore
  ) { 
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(6)]],
      repass: ['', [Validators.required, Validators.minLength(6)]],
      accountType: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.menuController.enable(true);
  }

  async register() {
    const email = this.registerForm.get('email')?.value.trim() || '';
    const pass = this.registerForm.get('pass')?.value.trim() || '';
    const repass = this.registerForm.get('repass')?.value || '';
    const accountType = this.registerForm.get('accountType')?.value || 'usuario'; // Capturar el tipo de cuenta
    
    if (pass !== repass) {
      const toast = await this.toastController.create({
        message: 'Las contraseñas no coinciden.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }
  
    try {
      const aux = await this.authService.register(email, pass);
      const user = aux.user;
  
      if (user) {
        await this.firestore.collection('usuarios').doc(user.uid).set({
          uid: user.uid,
          nombre: this.registerForm.get('firstName')?.value,
          apellido: this.registerForm.get('lastName')?.value,
          email: user.email,
          pass: pass,
          tipo: accountType // Guardar el tipo de cuenta (usuario o conductor)
        });
  
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso!',
          text: 'Cuenta registrada con éxito.',
          confirmButtonText: 'Iniciar sesión',
          heightAuto: false
        }).then(() => {
          this.router.navigate(['/log-in']);
        });
      }
  
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Hubo un error!',
        text: 'Error al registrar la cuenta.',
        confirmButtonText: 'Reintentar',
        heightAuto: false,
      });
    }
  }

  goToLogin(){
    this.router.navigate(['/log-in']);
  }

  setAccountType(type: string) {
    this.tipoCuenta = type;
    this.registerForm.controls['tipoCuenta'].setValue(type);
  }
}
