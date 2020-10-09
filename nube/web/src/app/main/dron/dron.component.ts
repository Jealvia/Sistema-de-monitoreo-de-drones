import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { DronService } from "app/services/dron/dron.service";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { IDron, IPATCHDron } from "app/services/dron/type";
import BaseRequest from "app/utils/baseRequest";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-dron",
  templateUrl: "./dron.component.html",
  styleUrls: ["./dron.component.scss"],
})
export class DronComponent implements OnInit {
  displayedColumns: string[] = [
    "descripcion",
    "modelo",
    "numero_serie",
    "tipo_dron",
    "marca",
    "capacidad",
    "acciones",
  ];
  dataSource: MatTableDataSource<IDron>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // MatPaginator Inputs
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // MatPaginator Output
  pagineo: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
  };
  public drones: Array<IDron>;

  constructor(
    public dialog: MatDialog,
    private dronService: DronService,
    public dialogRef: MatDialogRef<DialogDron>
  ) {}

  ngOnInit(): void {
    this.getDrones();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public getDrones() {
    this.dronService.getDrones().subscribe((z) => {
      this.drones = z;
      this.dataSource = new MatTableDataSource(this.drones);
      this.pagineo.length = z.length;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  public openDialog(item?: any) {
    const dialogRef = this.dialog.open(DialogDron, {
      width: "70%",
      data: item,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed", result);
      this.getDrones();
    });
  }
}

/* ******************************************************************************************************
  Dialog
  ******************************************************************************************************/

@Component({
  selector: "dialogDron",
  templateUrl: "./dialogDron.html",
  styleUrls: ["./dialog_area.component.scss"],
})
export class DialogDron {
  dronForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogDron>,
    private dronService: DronService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data?: IDron
  ) {
    this.dronForm = this.formBuilder.group({
      id: [0],
      modelo: ["", Validators.required],
      numero_serie: ["", Validators.required],
      tipo_dron: ["", Validators.required],
      marca: ["", Validators.required],
      capacidad: [
        "",
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.max(999999),
        ]),
      ],
      descripcion: ["", Validators.required],
    });
    if (data._id) {
      this.dronForm.setValue({
        id: data._id,
        tipo_dron: data.tipo_dron,
        capacidad: data.capacidad,
        marca: data.marca,
        modelo: data.modelo,
        numero_serie: data.numero_serie,
        descripcion: data.descripcion ?? "",
      });
    }
    console.log("DATA RECIBIDA: ", data);
  }

  onNoClick(): void {
    console.log("saliendo ", this.data);
    this.dialogRef.close();
  }

  onSubmit() {
    const dataRequest: BaseRequest = new BaseRequest(
      this.dronForm.value,
      this.dronForm.value.id
    );
    console.log("Data: ", this.dronForm);
    if (this.dronForm.value.id == 0) {
      this.dronService.saveDron(dataRequest.save()).subscribe(
        (res) => {
          console.log(res);
          this.dialogRef.close();
        },
        (error) => {}
      );
    } else {
      this.dronService.updateDron(dataRequest.update()).subscribe(
        (res) => {
          console.log(res);
          this.dialogRef.close();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }
}
