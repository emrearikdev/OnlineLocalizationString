
export const handleExport = (data, toastRef) => {
  try {
    const jsonString = JSON.stringify({
      sourceLanguage: "en",
      strings: data,
      version: "1.0",
    });

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Localizable.xcstrings";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toastRef.current.show({
      severity: "success",
      summary: "Success",
      detail: "Export successful",
      life: 3000,
    });
  } catch (error) {
    console.error("Error exporting data: ", error);
    toastRef.current.show({
      severity: "error",
      summary: "Error",
      detail: "Export failed",
      life: 3000,
    });
  }
};
