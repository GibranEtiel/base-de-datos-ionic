import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Noticias } from './noticias';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {
  //variable de conexión a Base de Datos
  public database!: SQLiteObject;

  //variables de creación de Tablas
  tablaNoticia: string = "CREATE TABLE IF NOT EXISTS noticia(idnoticia INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(100) NOT NULL, texto TEXT NOT NULL);";

  // variables para los insert por defecto en nuestras tablas
  registroNoticia: string = "INSERT or IGNORE INTO noticia(idnoticia, titulo, texto) VALUES (1,'Soy un titulo', 'Soy el texto de esta noticia que se esta insertando de manera automatica')";
  
  // variables para guardar los datos de las consultas en las tablas
  listadoNoticias = new BehaviorSubject([]);

  // variable para el status de la base de datos
  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private sqlite: SQLite, private platform: Platform,private alertController: AlertController) { 
    this.createBD

  }



  async presentAlert(titulo:string,msj:string) {
    const alert = await this.alertController.create({
      header: 'A Short Title Is Best',
      subHeader: 'A Sub Header Is Optional',
      message: 'A message should be a short, complete sentence.',
      buttons: ['Action'],
    });

    await alert.present();
  }
  //metodos para manipular los observables 
  fetchNoticias(): Observable<Noticias[]>{
    return this.listadoNoticias.asObservable();
  }
  dbState(){
    return this.isDBReady.asObservable();
  }
  //funcion para crear la bas  de datos 
  createBD(){
    //VERIFICAR SI LA PLATAFORMA ESTA DISPONIBLE 
    this.platform.ready().then(()=>{
      //crear la base de datos 
      this.sqlite.create({
        name:'noticias.db',
        location: 'default'
      }) .then((db: SQLiteObject)=>{
        this.database =db;
        //llamar a la funcion para crear las tablas
        this.crearTablas();
    }).catch(e=>{
      this.presentAlert('base de datos', 'error en crear la bd' + JSON.stringify(e));
    })
  })
}
async crearTablas(){
  try{
    //ejecuto la creacion de tablas 
    await this.database.executeSql(this.tablaNoticia,[]);
    //ejecuto los insert por defecto en el caso que existan 
    await this.database.executeSql(this.registroNoticia,[]);
    //modifico el estado de la base de datos 
    this.isDBReady.next(true);
  }catch(e){
    this.presentAlert('creacion de tablas','error en crear tablas '+ JSON.stringify(e));
  }
  }
}