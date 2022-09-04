
class User{

    #data = {};
    
    constructor(dataFields){

        if(!dataFields || !dataFields.phone) return;

        this.#data= dataFields;
    };
    

    edit(dataFields){

        if(!dataFields ) return;
        if(dataFields.phone !== undefined && dataFields.phone.length == 0 || dataFields.phone == " ") return;
        
        this.#data = {...this.#data, ...dataFields};
    };

    get(){
       return this.#data;
    };
};

class Contacts{
    #data= [];

    lastId= 0;

    add(dataFields){

        const contact = new User(dataFields);

        if(!contact || !contact.get) return;

        if( Object.keys(contact.get()).length== 0 ) return;

       
        this.lastId++;
        contact.id = this.lastId;

        this.#data.push(contact);
    };

    edit(id, dataFields){

        if(!id) return;

        const contact = this.get(id);

        if(!contact) return;

        contact.edit(dataFields);

    };

    remove(id){

        if(!id) return;

        const newData= this.#data.filter(item => item.id != id);

        this.#data = newData;

    };

    get(id, print = false){

        if(id> 0){
            const contact = this.#data.find(item => item.id== id);

            if(contact) return print? contact.get(): contact;
        } else if(!id && print){

            this.#data.forEach(item => console.log(item.get()));
            return;

        }
        return this.#data;
    };
};

// const myContact= new Contacts();
// myContact.add({phone: "+375290000", name: "Oleg"});
// myContact.add({phone: "+375291111", email: "super8@gmail.com"});
// myContact.add({phone: "+375292222", address: "Minsk"});
// myContact.add({phone: "+375293333", name: "Vlad", address: "Minsk"});
// console.log( myContact.get(false, true) );

class ContactsApp extends Contacts{
   
    constructor(id){
        super();

        this.contactInput = null;
        this.contactInputValue= null;
        this.contactBtnAdd= null;
        this.contactElem= null;
        this.contactInputValuePhone= null;
        this.editStatus= false;
        this.editId= null;

        this.data=[];

            // this.add({phone: "+375290000", name: "Oleg"});
            // this.add({phone: "+375292222", address: "Minsk"});
            // this.add({phone: "+375293333", name: "Vlad", address: "Minsk"});

        this.app();
    };

    update(){

        this.data = this.get();

        this.contactInput.value= "";
        this.contactInputName.value= "";
        this.contactsList.innerHTML= "";

        this.data.forEach( contact=>{

            let id = contact.id;

            contact= contact.get();
            
            this.contactElem = document.createElement("li");
            this.contactElem.classList.add("contact");
            this.contactElem.dataset.id= id;

            if(contact.phone) this.contactElem.innerHTML=`<h3 class="contact_phone">${contact.phone}</h3>`;

            if(contact.name) this.contactElem.innerHTML +=`<h4 class="contact_name">${contact.name}</h4>`;

            this.contactElem.innerHTML +=`
                <div class="contact_btns">
                    <button class="btn_edit">Edit</button>
                    <button class="btn_del">Delete</button>
                </div>
            `;
            this.contactsList.append(this.contactElem);

            this.btnDel= this.contactElem.querySelector(".btn_del");

            this.btnDel.addEventListener("click", (event) =>{
                this.onDelete(id);
            });

            this.btnEdit = this.contactElem.querySelector(".btn_edit");
            
            // this.btnEdit.addEventListener("click", (event)=> {
            //     this.onEdit(id);
            // });

            this.btnEdit.addEventListener("click", (event)=> {
                this.onEdit2(id);
            });

            //drag &drop

        this.contactElem.draggable= true;

        this.dragElem = null;

        this.contactElem.addEventListener("dragstart", (event) =>{
            
            event.target.classList.add("dragstart");

            event.dataTransfer.setData("dragElemId", id);
            


        });

        this.contactElem.addEventListener("dragend", (event) =>{
           
            event.target.classList.remove("dragstart");
        });

        this.contactElem.addEventListener("drag", (event) =>{
            // console.log("drag");
        });

        this.contactElem.addEventListener("dragenter", (event) =>{

            this.elem = event.target;

            if(this.elem.nodeName != "li" || this.elem.classList.contains("contact")) {
                this.elem= this.elem.closest("li.contact");
            };

            this.elem.classList.add("dragenter");
        });

        this.contactElem.addEventListener("dragleave", (event) =>{

            this.elem = event.target;

            if(this.elem.nodeName != "li" || this.elem.classList.contains("contact")) {
                this.elem= this.elem.closest("li.contact");
            };

            if(event.fromElement== this.contactsList || event.fromElement.id== "root") this.elem.classList.remove("dragenter");
        });

        this.contactElem.addEventListener("dragover", (event) =>{
            event.preventDefault();
        });

        this.contactElem.addEventListener("drop", (event) =>{

            this.elem = event.target;

            if(this.elem.nodeName != "li" || this.elem.classList.contains("contact")) {
                this.elem= this.elem.closest("li.contact");
            };

            const dragElemId = event.dataTransfer.getData("dragElemId");
            const dragElem= this.contactsList.querySelector(`[data-id="${dragElemId}"]`);

            if(!dragElem) return;

            this.elem.before(dragElem);

            this.elem.classList.remove("dragenter")
        });
    });

        this.setStorage();
    };

    getCookie(name) {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    setCookie(name, value, options = {}) {

        options = {
          path: '/',
          ...options
        };
      
        if (options.expires instanceof Date) {
          options.expires = options.expires.toUTCString();
        }
      
        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
      
        for (let optionKey in options) {
          updatedCookie += "; " + optionKey;
          let optionValue = options[optionKey];
          if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
          };
        };
      
        document.cookie = updatedCookie;
    };

    setStorage(){

        this.dataTmp = this.data.map(item =>{
            return {...{id: item.id}, ...item.get()};
        });

        this.dataJson= JSON.stringify(this.dataTmp);

        if(!this.dataJson) return;

        localStorage.setItem("data", this.dataJson);

        if(this.dataJson && this.dataJson != "[]")this.setCookie("dataExp", "10", {"max-age": 864000});
    };

    getStorage(){

        this.dataTmp = localStorage.getItem("data");
        if(!this.dataTmp) return;

        this.dataTmp = JSON.parse(this.dataTmp);

        this.dataTmp.forEach(item =>{
            delete item.id;
            this.add(item);
        });
    };

    getData(){

        console.log("get data")

        fetch("https://jsonplaceholder.typicode.com/users").then(response =>{
            if(response.status== 200) return response.json();
        }).then(body =>{

            if(body && body.length> 0){
                
                this.dataTmp= body.map(item =>{
                    return {phone: item.phone, name: item.name}
                });

                this.dataTmp.forEach(item =>{
                    this.add(item);
                });

                this.update();
            };
        });
    };

    app(){// init

        this.dataExp= this.getCookie("dataExp");

        if(!this.dataExp){
            localStorage.removeItem("data");
        };

        this.getStorage();

        if(this.get().length== 0 ) this.getData();

        this.rootElem = document.querySelector("#" + "root");

        if(!this.rootElem) return;

        this.rootElem.innerHTML=`
            <div class="contacts">
                <div class="contacts_form"></div>
                <ul class="contacts_list"></ul>
            </div>
        `;

        this.contactsForm = this.rootElem.querySelector(".contacts_form");
        this.contactsList = document.querySelector(".contacts_list");
        if(!this.contactsForm || !this.contactsList) return;

        this.contactInput = document.createElement("input");
        this.contactInput.type= "text";
        this.contactInput.name= "contact_new";
        this.contactInput.placeholder= "New a number";

        this.contactInputName = document.createElement("input");
        this.contactInputName.type= "text";
        this.contactInputName.name= "contact_name";
        this.contactInputName.placeholder= "New a contact Name";

        this.contactBtnAdd = document.createElement("button");
        this.contactBtnAdd.classList.add("btn_add");
        this.contactBtnAdd.innerHTML="Add contact";

        this.contactsForm.append(this.contactInput, this.contactInputName, this.contactBtnAdd);


        this.contactInput.addEventListener("keyup", (event)=>{
            this.onGetPhoneName();
        });

        this.contactInputName.addEventListener("keyup", (event)=>{
            this.onGetPhoneName();
        });

        this.contactBtnAdd.addEventListener("click", (event)=>{
            this.onAddBtn(event);
        });

        // this.contactBtnAdd.addEventListener("click", (event)=>{
        //     this.onSave(event);
        // });

        // this.contactBtnAdd.addEventListener("click", (event)=>{
        //     this.onSave2(event);
        // });

        this.update();

    };

    

    onGetPhoneName(event){
        if(!this.contactInput) return;

        this.contactInputValue= this.contactInput.value;

        if(this.contactInputName){

            this.contactInputValuePhone= this.contactInputName.value;
        };
    };

    onAddBtn(event){

        if(this.editStatus) return;

        if(!this.contactInput) return;

        const phone = this.contactInputValue;
        const name = this.contactInputValuePhone;
        
        this.add({
            phone: phone,
            name: name
        });

        this.update();

        this.contactInputValue= "";
        this.contactInputValuePhone= "";
    };

    onDelete(id){
        this.remove(id);
        this.update();
    };

    onEdit(id){
        this.contact = this.get(id, true);

        if(!this.contact) return;

        this.editStatus = true;
        this.editId= id;

        this.contactInput.value= this.contact.phone;

        this.contactInputName.value="";

        if(this.contact.name && this.contact.name.length> 0) this.contactInputName.value = this.contact.name;
    };

    onEdit2(id){
        this.contact = this.get(id, true);

        if(!this.contact) return;

        this.editId= id;

        document.querySelectorAll(".contact_edit_form").forEach(elem => elem.remove());

        const formEditElem = document.createElement("div");
        formEditElem.classList.add("contact_edit_form");

        const phoneEditElem = document.createElement("div");
        phoneEditElem.classList.add("contact_edit_form_phone");
        phoneEditElem.innerHTML= this.contact.phone;

        const nameEditElem = document.createElement("div");
        nameEditElem.classList.add("contact_edit_form_name");
        if(this.contact.name && this.contact.name.length> 0) nameEditElem.innerHTML= this.contact.name;

        const formSaveBtn = document.createElement("button");
        formSaveBtn.classList.add("contact_edit_form_btn_save");
        formSaveBtn.innerHTML= "Save";

        const formCloseBtn = document.createElement("button");
        formCloseBtn.classList.add("contact_edit_form_btn_close");
        formCloseBtn.innerHTML= "Close";

        formCloseBtn.addEventListener("click", ()=>{
            formEditElem.remove();
        });

        formSaveBtn.addEventListener("click", (event)=>{
            this.onSave2(event, formEditElem, phoneEditElem, nameEditElem);
        })

        document.body.append(formEditElem);

        formEditElem.append(phoneEditElem, nameEditElem, formSaveBtn, formCloseBtn);

        phoneEditElem.contentEditable= true;
        nameEditElem.contentEditable= true;
    };

    onSave(event){
        if(!this.editStatus || !this.editId) return;

        if(!this.contactInput) return;

        const phone = this.contactInputValue;
        const name = this.contactInputValuePhone;

        this.contact = this.get(this.editId);

        if(!this.contact) return;
        
        this.contact.edit({
            phone: phone,
            name: name
        });

        this.editStatus= false;
        this.editId= null;

        this.update();

        this.contactInputValue= "";
        this.contactInputValuePhone= "";
    };

    onSave2(event, formElem, phoneElem, nameElem){
        if(!this.editId) return;

        if(!formElem) return;

        const phone = phoneElem.innerHTML;
        const name = nameElem.innerHTML;

        this.contact = this.get(this.editId);

        if(!this.contact) return;
        
        this.contact.edit({
            phone: phone,
            name: name
        });

        formElem.remove();

        this.editId= null;

        this.update();

        console.log("click")
    };
};

( new ContactsApp("root") );

