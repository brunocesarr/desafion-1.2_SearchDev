let allDevs = [];
let filteredDevs = [];

let name;
let filtersSelected;
let conditionSelected;

let searchName;
let searchFilter;
let searchCondition;

let countDevs;
let resultSearch;

window.addEventListener("load", () => {
  searchName = document.querySelector("#searchName");
  searchFilter = document.querySelectorAll("input[name='searchFilter']");
  searchCondition = document.querySelectorAll("input[name='searchCondition']");

  countDevs = document.querySelector("#countDevs");
  resultSearch = document.querySelector("#resultSearch");

  fetchDevs().catch((error) => {
    resultSearch.innerHTML += `
    <div class="alert alert-danger" role="alert">
      ${error}
    </div>
    `;
  });

  searchName.addEventListener("input", searchNameDev);
  searchFilter.forEach((filter) =>
    filter.addEventListener("change", filterDevs)
  );
  searchCondition.forEach((condition) =>
    condition.addEventListener("change", filterDevs)
  );
});

const fetchDevs = async () => {
  const response = await fetch("http://localhost:3001/devs");
  const json = await response.json();

  allDevs = json.map((dev) => {
    const { id, name, picture, programmingLanguages } = dev;
    return {
      id,
      name,
      picture,
      languages: programmingLanguages.map((programmingLanguage) => {
        const { id, language } = programmingLanguage;
        return { id, language };
      }),
    };
  });
  filteredDevs = [...allDevs];

  render();
};

const render = () => {
  devsHTML = '<div class="card-columns">';
  filteredDevs.forEach((dev) => {
    const { name, picture, languages } = dev;

    let devHTML = `
      <div class="card row justify-content-between">
        <img class="rounded-circle float-left p-2" src="${picture}" alt="picture">
        <div class="card-body float-left">
          <p class="card-text text-wrap">${name}</p>
          <hr width="100%"/>
          <div id="languages" class="row justify-content-start">`;

    languages.forEach((lang) => {
      const { language } = lang;

      languagePicture = language.toLowerCase() + ".png";

      const languageHTML = `
        <img 
          class="ml-3" 
          width="30" 
          data-toggle="tooltip" 
          data-placement="bottom" 
          title="${language}"
          src="./assets/${languagePicture}" alt="picture"
        >
      `;
      devHTML += languageHTML;
    });

    devHTML += `      
          </div>
        </div>
      </div>
    `;

    devsHTML += devHTML;
  });

  countDevs.innerHTML = filteredDevs.length;

  resultSearch.innerHTML = devsHTML;
};

const normalizeName = (nome) => {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/( )+/g, "")
    .toLowerCase();
};

const searchNameDev = () => {
  searchName.value = normalizeName(searchName.value);
  name = normalizeName(searchName.value);
  filterDevs();
};

const filterDevs = () => {
  if (!name) {
    filteredDevs = [...allDevs];
  } else {
    filteredDevs = allDevs.filter((dev) =>
      normalizeName(dev.name).includes(name)
    );
  }

  mapFilterSelected();

  if (filtersSelected.length === 0) {
    render();
    return;
  }

  if (conditionSelect === "E")
    filteredDevs = filteredDevs.filter((dev) => {
      const languages = dev.languages.map((lang) => lang.language);
      return filtersSelected.every((selected) =>
        languages.find((lang) => lang === selected)
      );
    });
  else {
    filteredDevs = filteredDevs.filter((dev) => {
      const languages = dev.languages.map((lang) => lang.language);

      return filtersSelected.some((selected) =>
        languages.find((lang) => lang === selected)
      );
    });
  }

  render();
};

const mapFilterSelected = () => {
  const filters = Array.from(searchFilter);
  const conditions = Array.from(searchCondition);

  filtersSelected = filters
    .filter((filter) => filter.checked)
    .map((selected) => selected.value);

  conditionSelect = conditions.find((condition) => condition.checked).value;
};
