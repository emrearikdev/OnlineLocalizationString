import React, { useState, useEffect, useRef } from "react";
import { storage } from "./firebase";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import {
  ref,
  getDownloadURL,
  uploadString,
  uploadBytes,
} from "firebase/storage";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { handleExport, moveToProd } from "./utils/exportAndImport.js";

const App = () => {
  const [data, setData] = useState({});
  const [newItemKey, setNewItemKey] = useState("");
  const [newItemValueEN, setNewItemValueEN] = useState("");
  const [newItemValueDE, setNewItemValueDE] = useState("");
  const [newItemValueFR, setNewItemValueFR] = useState("");
  const [newItemValueIT, setNewItemValueIT] = useState("");
  const [newItemValueES, setNewItemValueES] = useState("");
  const [newItemValuePL, setNewItemValuePL] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [tempData, setTempData] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [newItemDialog, setNewItemDialog] = useState(false);
  const [environment, setEnvironment] = useState("TEST");
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    fetchData();
  }, [environment]);

  const fetchData = async () => {
    setLoading(true);
    setGlobalFilter("");

    try {
      const fileRef = ref(storage, `Strings/${environment}/Localizable.xcstrings`);
      const url = await getDownloadURL(fileRef);
      const response = await fetch(url);
      const text = await response.text();

      const result = parseXCStrings(text);
      setData(result);
      setTempData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const parseXCStrings = (text) => {
    try {
      const json = JSON.parse(text);
      return json.strings || {};
    } catch (error) {
      console.error("Error parsing xcstrings: ", error);
      return {};
    }
  };

  const handleAddItem = () => {
    setNewItemDialog(true);
  };

  const handleSaveNewItem = () => {
    if (!newItemKey || !newItemValueEN) return;

    const updatedData = {
      [newItemKey]: {
        extractionState: "manual",
        localizations: {
          en: { stringUnit: { state: "translated", value: newItemValueEN } },
          fr: { stringUnit: { state: "translated", value: newItemValueFR } },
          de: { stringUnit: { state: "translated", value: newItemValueDE } },
          it: { stringUnit: { state: "translated", value: newItemValueIT } },
          pl: { stringUnit: { state: "translated", value: newItemValuePL } },
          es: { stringUnit: { state: "translated", value: newItemValueES } }
        },
      },
      ...tempData,
    };

    setTempData(updatedData);
    setNewItemKey("");
    setNewItemValueEN("");
    setNewItemValueFR("");
    setNewItemValueDE("");
    setNewItemValueIT("");
    setNewItemValuePL("");
    setNewItemValueES("");
    setNewItemDialog(false);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const jsonString = JSON.stringify({
        sourceLanguage: "en",
        strings: tempData,
        version: "1.0",
      });

      const fileRef = ref(storage, `Strings/${environment}/Localizable.xcstrings`);
      await uploadString(fileRef, jsonString, "raw");

      setData(tempData);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Kaydetme başarılı",
        life: 3000,
      });
    } catch (error) {
      console.error("Error saving data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellDoubleClick = (key, locale) => {
    setEditMode({ key, locale });
    setEditValue(tempData[key].localizations[locale].stringUnit.value);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEditSave = (key, locale) => {
    const updatedData = {
      ...tempData,
      [key]: {
        ...tempData[key],
        localizations: {
          ...tempData[key].localizations,
          [locale]: {
            ...tempData[key].localizations[locale],
            stringUnit: {
              ...tempData[key].localizations[locale].stringUnit,
              value: editValue,
            },
          },
        },
      },
    };

    setTempData(updatedData);
    setEditMode(null);
  };

  const renderEditableCell = (key, locale) => {
    if (!tempData[key] || !tempData[key].localizations[locale]) {
      return null;
    }

    if (editMode && editMode.key === key && editMode.locale === locale) {
      return (
        <InputText
          type="text"
          value={editValue}
          onChange={handleEditChange}
          onBlur={() => handleEditSave(key, locale)}
          autoFocus
        />
      );
    }
    return (
      <span onDoubleClick={() => handleCellDoubleClick(key, locale)}>
        {tempData[key].localizations[locale].stringUnit.value}
      </span>
    );
  };

  const handleDeleteSelected = () => {
    const updatedData = { ...tempData };
    selectedRows.forEach((row) => {
      delete updatedData[row.key];
    });
    setTempData(updatedData);
    setSelectedRows([]);
  };

  const handleGlobalFilterChange = (e) => {
    setGlobalFilter(e.target.value);
  };

  const header = (
    <div className="table-header">
      <h5>Localizations</h5>
      <div className="header-right">
        <Dropdown
          value={environment}
          options={[
            { label: "PROD", value: "PROD" },
            { label: "TEST", value: "TEST" },
          ]}
          onChange={(e) => setEnvironment(e.value)}
          placeholder="Select Environment"
        />
        <InputText
          type="search"
          value={globalFilter}
          onChange={handleGlobalFilterChange}
          placeholder="Search"
        />
      </div>
    </div>
  );

  const transformedData = Object.keys(tempData).map((key) => {
    const localizations = tempData[key].localizations;
    return {
      key,
      en: localizations.en ? localizations.en.stringUnit.value : "",
      fr: localizations.fr ? localizations.fr.stringUnit.value : "",
      de: localizations.de ? localizations.de.stringUnit.value : "",
      it: localizations.it ? localizations.it.stringUnit.value : "",
      pl: localizations.pl ? localizations.pl.stringUnit.value : "",
      es: localizations.es ? localizations.es.stringUnit.value : ""
    };
  });

  const newItemDialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setNewItemDialog(false)}
        className="p-button-text"
      />
      <Button label="Save" icon="pi pi-check" onClick={handleSaveNewItem} />
    </div>
  );

  const handleImport = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const fileRef = ref(
        storage,
        `Strings/${environment}/Localizable.xcstrings`
      );

      try {
        await uploadBytes(fileRef, file);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Import successful",
          life: 3000,
        });
        fetchData();
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Import failed",
          life: 3000,
        });
      }
    }
  };

  const moveToProd = async () => {
    setLoading(true);

    try {
      const jsonString = JSON.stringify({
        sourceLanguage: "en",
        strings: tempData,
        version: "1.0",
      });

      const fileRef = ref(storage, `Strings/PROD/Localizable.xcstrings`);
      await uploadString(fileRef, jsonString, "raw");

      setData(tempData);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Data moved to PROD successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error moving data to PROD: ", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to move data to PROD",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Toast ref={toast} position="center" />
      <div className="button-bar">
        <Button label="New" icon="pi pi-plus" onClick={handleAddItem} />
        <Button
          label="Delete"
          icon="pi pi-trash"
          className="p-button-danger"
          style={{ marginLeft: "10px" }}
          onClick={handleDeleteSelected}
        />
        <Button
          label="Import"
          icon="pi pi-upload"
          onClick={() => document.getElementById("fileInput").click()}
          className="p-button-text"
        />

        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={(e) => handleImport(e)}
          accept=".xcstrings"
        />

        <Button
          label="Export"
          icon="pi pi-download"
          onClick={() => handleExport(tempData, toast)}
          className="p-button-text"
        />
        <Button
          label="Move to PROD"
          icon="pi pi-move"
          onClick={() => moveToProd()}
          className="p-button-edit"
          style={{ marginLeft: "auto" }}
        />
        <Divider layout="vertical" className="hidden md:flex" />
        <Button
          label="Save"
          icon="pi pi-save"
          onClick={handleSave}
          className="p-button-success"
        />
      </div>
      <div className="button-bar"></div>
      <div
        className="spinner-container"
        style={{ display: loading ? "flex" : "none" }}
      >
        <ProgressSpinner
          style={{ width: "50px", height: "50px" }}
          strokeWidth="8"
        />
      </div>
      <DataTable
        value={transformedData}
        header={header}
        globalFilter={globalFilter}
        paginator
        rows={50}
        responsiveLayout="scroll"
        selectionMode="checkbox"
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
      >
        <Column selectionMode="multiple" style={{ width: "3em" }} />
        <Column field="key" header="Key" />
        <Column
          field="en"
          header="EN"
          body={(rowData) => renderEditableCell(rowData.key, "en")}
        />
        <Column
          field="fr"
          header="FR"
          body={(rowData) => renderEditableCell(rowData.key, "fr")}
        />
        <Column
          field="de"
          header="DE"
          body={(rowData) => renderEditableCell(rowData.key, "de")}
        />
        <Column
          field="it"
          header="IT"
          body={(rowData) => renderEditableCell(rowData.key, "it")}
        />
        <Column
          field="pl"
          header="PL"
          body={(rowData) => renderEditableCell(rowData.key, "pl")}
        />
        <Column
          field="es"
          header="ES"
          body={(rowData) => renderEditableCell(rowData.key, "es")}
        />
      </DataTable>
      <Dialog
        header="Add New Item"
        visible={newItemDialog}
        style={{ width: "400px" }}
        footer={newItemDialogFooter}
        onHide={() => setNewItemDialog(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="key">Key</label>
            <InputText
              id="key"
              value={newItemKey}
              onChange={(e) => setNewItemKey(e.target.value)}
            />
          </div>
          <div className="p-field">
            <label htmlFor="en">EN</label>
            <InputText
              id="en"
              value={newItemValueEN}
              onChange={(e) => setNewItemValueEN(e.target.value)}
            />
          </div>
          <div className="p-field">
            <label htmlFor="fr">FR</label>
            <InputText
              id="fr"
              value={newItemValueFR}
              onChange={(e) => setNewItemValueFR(e.target.value)}
            />
          </div>
          <div className="p-field">
            <label htmlFor="de">DE</label>
            <InputText
              id="de"
              value={newItemValueDE}
              onChange={(e) => setNewItemValueDE(e.target.value)}
            />
          </div>
         
          <div className="p-field">
            <label htmlFor="it">IT</label>
            <InputText
              id="it"
              value={newItemValueIT}
              onChange={(e) => setNewItemValueIT(e.target.value)}
            />
          </div>
          <div className="p-field">
            <label htmlFor="pl">PL</label>
            <InputText
              id="pl"
              value={newItemValuePL}
              onChange={(e) => setNewItemValuePL(e.target.value)}
            />
          </div>
          <div className="p-field">
            <label htmlFor="es">ES</label>
            <InputText
              id="es"
              value={newItemValueES}
              onChange={(e) => setNewItemValueES(e.target.value)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default App;
