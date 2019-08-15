/*-- get data from HTML and parse this to dictionary --*/
var jsonFromHTML = document.getElementById("json").innerHTML;
var cleanJsonFromHTML1 = jsonFromHTML.replace(/"/g,'');
var cleanJsonFromHTML = cleanJsonFromHTML1.replace(/&#34;/g,'"');
// jsonDictionary is global variable which is used and overriding in many functions
var jsonDictionary = JSON.parse(cleanJsonFromHTML);


hideLoad()


if('undefined'.localeCompare(jsonDictionary['error']) != 0){
    optimize_message(jsonDictionary['error']);
    }


function optimize_message(message){
    var array = message.split(" ");

    var arrays = [], size = 6;
    while (array.length > 0)
        arrays.push(array.splice(0, size).join(" "));

    var files = ''
    for(var key in Object.keys(arrays))
        files = files + arrays[key] + '\n'
    var text = $("#warning").text(files)
    text.html(text.html().replace(/\n/g,'<br/>'));
    text.html(text.html().replace(/"/g, ''));
    text.html(text.html().replace('&amp;#39;', "'"));
    text.html(text.html().replace('&amp;#39;', "'"));
    text.html(text.html().replace(/^(?:')/, ""));
    text.html(text.html().replace(/(?:'<br>)$/, ""));
}

/*Tooltips*/
$('#i_mandatory_fields').tooltip({
    title : 'Section with mandatory fields settings. These fields must be presented in the uploaded file. It is immutable setting',
    placement: 'top'
});
$('#i_special_fields').tooltip({
    title : 'Section with special fields settings - additional fields that added for user needs. It is mutable setting',
    placement: 'top'
});
$('#i_refering_to').tooltip({
    title : 'Significance top settings. Choose values for building significance top',
    placement: 'top'
});
$('#i_resolution_settings_for_sm').tooltip({
    title : 'It is setting for single mode. You need to set only two resolutions: \nXML Element Name - field from XML file \nValue - resolution value for XML field',
    placement: 'top'
});
$('#i_table_settings_for_mm').tooltip({
    title : 'Mandatory fields for multiple mode',
    placement: 'top'
});
$('#i_area_of_testing_fields').tooltip({
    title : 'Section with area of testing fields settings - additional fields that added for user needs. It is mutable setting',
    placement: 'top'
});


$('#referring_to').select2({width:'100%'});

// Disable default action on ENTER keypress
document.addEventListener('keypress', function(event) {
    if (event.keyCode == 13) {
        event.preventDefault();
    }
});

function data_type_tooltip(cell){
    switch(cell.getValue()){
        case 'text': return 'string type, with full line search'
        case 'text1': return 'string type, with substring search'
        case 'text2': return 'string type, with multiple substring search'
        case 'number': return 'float type, with full match search'
        case 'date': return 'date type, with full match search'
        case 'categorical': return 'string type, with isin search'
        case 'bool': return 'boolean type, with full match search'
        
    }
}


function mandatory_fields_table(data){
        return new Tabulator('#mandatory_fields', {
        data: data['mandatory_fields'],
        height:"311px",
        layout: 'fitColumns',
        columns: [
            { title: 'GUI name', field: 'gui_name' },
            { title: 'XML name', field: 'xml_name' },
            { title: 'type', field: 'type', 
                tooltip:function(cell){
                    switch(cell.getValue()){
                        case 'text': return 'string type, with full line search'
                        case 'text1': return 'string type, with substring search'
                        case 'text2': return 'string type, with multiple substring search'
                        case 'number': return 'float type, with full match search'
                        case 'date': return 'date type, with full match search'
                        case 'categorical': return 'string type, with isin search'
                        case 'bool': return 'boolean type, with full match search'
            }
        } }
        ]
    });
}

var mandatory_fields = mandatory_fields_table(jsonDictionary)


function multiple_mod_fields_table(data){
        return new Tabulator('#multiple_mode_fields', {
        data: getDataMultipleModFields(data['config_data']['multiple_mode_fields']),
        layout: 'fitColumns',
        width: "50%",
        columns: [{ title: 'GUI name', field: 'gui_name' }]

    });
}


function getDataMultipleModFields(multiple_mode_fields){
    table_multiple_mod_fields = []
    if (multiple_mode_fields){
        var i = 0
        multiple_mode_fields.split(",").forEach(function(item_mm){
            table_multiple_mod_fields[i] = {}
            table_multiple_mod_fields[i]['gui_name'] = item_mm;
            table_multiple_mod_fields[i]['1'] = 1; // tabulator works with only 2 values
            i++;
        })
    }
    return table_multiple_mod_fields
}


var multiple_mode_fields = multiple_mod_fields_table(jsonDictionary)

var validateTabulator = function (value){
    if (value && value.match('^[a-zA-Z0-9\\(\\)\\-_: ]+$'))
        return true
    else
        return false
}

function areaOfTestingTable(data){
    return new Tabulator('#area_of_testing_fields', {
        layout: 'fitColumns',
        addRowPos:"bottom",
        data: data['config_data']['area_of_testing_fields'],
        columns: [
            { formatter:'buttonCross', width:40, align:"center",sorter:"string", headerSort:false, cellClick:function(e, cell){cell.getRow().delete()}},
            { title: 'Name', field: 'gui_name', editable:true, editor:"input", tooltip:"Valid values: a-z, A-Z, (, ), -, _, :"},
            { formatter: function(cell, formatterParams, onRendered){
                onRendered(function(){
                    tag = $(cell.getElement()).find('textarea').tagify({duplicates:true, delimiters: "\\|", pattern:/^[a-zA-Z0-9\(\)\-_: ]+$/})
                    function addTag(){
                        var result = ""
                        $(cell.getElement()).find('tag').each(function(i, item){
                            result += item.textContent + '|'
                        })
                        result = result.split("|")
                        result.forEach(function(item, i, arr){
                            if (arr.lastIndexOf(item) != i)
                                arr.splice(i, 1)
                        })
                        result.splice(result.length-1, 1)
                        result = result.join("|")
                        cell.setValue(result)
                        tag = $(cell.getElement()).find('textarea').tagify({duplicates:true, delimiters: "\\|", pattern:/^[a-zA-Z0-9\(\)\-_: ]+$/})
                        $(cell.getElement()).find('tags').click()
                        tag.on('add', addTag)
                        cell.getRow().normalizeHeight();
                        $(cell.getElement()).find('tags').on("input", function(){cell.getRow().normalizeHeight();})
                        $(cell.getElement()).find('tags').on("change", function(){cell.getRow().normalizeHeight();})
                    }
                    tag.on('add', addTag)
                })
                if(cell.getValue()){
                    return '<textarea>'+cell.getValue()+'</textarea>'
                }
                else{
                    return '<textarea></textarea>'
                }
            }, title: 'Area of testing', field:'name', editor:true, variableHeight:true, tooltip:"Valid values: a-z, A-Z, (, ), -, _, :"
        }]
    });
}
var area_of_testing_fields = areaOfTestingTable(jsonDictionary)

function getAreaOfTesting(){
    var gui_names = $('#area_of_testing_fields').find('[tabulator-field="gui_name"]:not(:first)')
    var names = $('#area_of_testing_fields').find('[tabulator-field="name"]:not(:first)')
    var areaOfTesting = [] 
    var isCorrectAreas = true
    for(var i=0; i<gui_names.length; i++){
        if(gui_names[i].textContent.trim() != ''){
            if (validateTabulator(gui_names[i].textContent)){
                var namesStr = collectTagsInString(i)
                if (namesStr != ''){
                    var isValid = true
                    namesStr.split("|").forEach(function(val, ind, arr){
                        if (!validateTabulator(val))
                            isValid = false
                    })
                    if(isValid){
                        obj = {'gui_name': gui_names[i].textContent, 'name':collectTagsInString(i)}
                        areaOfTesting.push(obj)
                    }
                    else{
                        $(names[i]).css("border", "1px solid red")
                        $(names[i]).on("input", function(){ 
                            $(this).css("border", "") 
                        })
                        isCorrectAreas = false
                    }
                }
                else{
                    $(names[i]).css("border", "1px solid red")
                    $(names[i]).on("input", function(){ 
                        $(this).css("border", "") 
                    })
                    isCorrectAreas = false
                }
            }
            else{
                $(gui_names[i]).css("border", "1px solid red")
                $(gui_names[i]).on("input", function(){ 
                    $(this).css("border", "") 
                })
                isCorrectAreas = false
            }
        }
        else{
            if (names[i]){
                $(gui_names[i]).css("border", "1px solid red")
                    $(gui_names[i]).on("input", function(){ 
                        $(this).css("border", "") 
                    })
                    isCorrectAreas = false
            }
        }
    }
    if (isCorrectAreas)
        if (areaOfTesting.length != 0)
            return areaOfTesting
        else
            return [{}]
    else return false
}

function collectTagsInString(index){
    var result = ""
    var names = $('[tabulator-field="name"]:not(:first)').find('tags')
    $(names[index]).find('tag').each(function(index, item){
        result+=item.textContent+'|'
    })
    return result.slice(0, -1)
}

function special_fields_table(data){
        return new Tabulator('#special_fields', {
        layout: 'fitColumns',
        //pagination: 'local',
        //paginationSize: 4,
        addRowPos:"bottom",
        columns: [
            {formatter:'buttonCross', width:40, align:"center",sorter:"string", headerSort:false, cellClick:function(e, cell){cell.getRow().delete()}},
            { title: 'GUI name', field: 'gui_name', editable:true, editor:"input", tooltip:"Valid values: a-z, A-Z, (, ), -, _, :"},
            { title: 'XML name', field: 'xml_name', editor:true, tooltip:"Valid values: a-z, A-Z, (, ), -, _, :" },           
            { title: 'type', field: 'type', editor:"select", editorParams:{values:jsonDictionary['data_types']},
                tooltip:function(cell){
                    switch(cell.getValue()){
                        case 'text': return 'string type, with full line search'
                        case 'text1': return 'string type, with substring search'
                        case 'text2': return 'string type, with multiple substring search'
                        case 'number': return 'float type, with full match search'
                        case 'date': return 'date type, with full match search'
                        case 'categorical': return 'string type, with isin search'
                        case 'bool': return 'boolean type, with full match search'
                }
            }}
        ]
        });
}
var special_fields = special_fields_table(jsonDictionary)

function getSpecialFields(){
    var gui_names = $('#special_fields').find('[tabulator-field="gui_name"]:not(:first)')
    var xml_names = $('#special_fields').find('[tabulator-field="xml_name"]:not(:first)')
    var types = $('#special_fields').find('[tabulator-field="type"]:not(:first)')
    var special = [] 
    var isCorrectSpecial = true
    for(var i=0; i<gui_names.length; i++){
        if(gui_names[i].textContent.trim() != ''){
            if (validateTabulator(gui_names[i].textContent)){
                if (xml_names[i].textContent.trim() != ''){
                    var isValid = true
                    if (!validateTabulator(xml_names[i].textContent))
                        isValid = false
                    if(isValid){
                        obj = {'gui_name': gui_names[i].textContent, 'xml_name':xml_names[i].textContent, "type":types[i].textContent}
                        special.push(obj)
                    }
                    else{
                        $(xml_names[i]).css("border", "1px solid red")
                        $(xml_names[i]).on("input", function(){ 
                            $(this).css("border", "") 
                        })
                        isCorrectSpecial = false
                    }
                }
                else{
                    $(xml_names[i]).css("border", "1px solid red")
                    $(xml_names[i]).on("input", function(){ 
                        $(this).css("border", "") 
                    })
                    isCorrectSpecial = false
                }
            }
            else{
                $(gui_names[i]).css("border", "1px solid red")
                $(gui_names[i]).on("input", function(){ 
                    $(this).css("border", "") 
                })
                isCorrectSpecial = false
            }
        }
        else{
            if (gui_names[i]){
                $(gui_names[i]).css("border", "1px solid red")
                    $(gui_names[i]).on("input", function(){ 
                        $(this).css("border", "") 
                    })
                    isCorrectSpecial = false
            }
        }
    }
    if (isCorrectSpecial)
        if (special.length != 0)
            return special
        else
            return [{}]
    else return false
}

function get_data(){
    return Object.assign({}, {'mandatory_fields': JSON.stringify(mandatory_fields.getData())},
                             {'special_fields': JSON.stringify(getSpecialFields())}, 
                             {'area_of_testing_fields': JSON.stringify(getAreaOfTesting())},
                                {'referring_to': $('#referring_to').val(),
                                'resolution1name': $('#resolution1name').val(),
                                'resolution1value': $('#resolution1value').val(),
                                'resolution2name': $('#resolution2name').val(),
                                'resolution2value': $('#resolution2value').val(),
                                'multiple_mode_fields': jsonDictionary['config_data']['multiple_mode_fields']})
}

$("#add_row").click(function(){
    special_fields.addRow({})
});

$("#add_row_areas").click(function(){
    area_of_testing_fields.addRow({})
});


$(document).ready(function() {
    $('#referring_to').select2({width:'100%'});
});


// add categorical fields
for(i=0;i<jsonDictionary['referring_to'].length;i++){
    $("[id='referring_to']").append($("<option></option>").attr("value",jsonDictionary['referring_to'][i]).text(jsonDictionary['referring_to'][i]));
}


// AJAX for sent setting data
$('#submit_settings').click(function significanceTop() {
    if(!checkValidation() || !getAreaOfTesting() || !getSpecialFields()){
        if (!getSpecialFields()){
            optimize_message("Please correctly fill in all required Special fields.")
            $('html, body').animate({scrollTop: 0}, 600);
            return
        }
        else if (!getAreaOfTesting()){
            optimize_message("Please correctly fill in all required Area of Testing fields.")
            $('html, body').animate({scrollTop: 0}, 600);
            return
        }
        $('#setting_form').find(':submit').click();
        return;
        }
    $.ajax({
            type: "POST",
            url: '/set_config',
            beforeSend: setLoad(),
            data: get_data(),
            success: function(response, status, xhr){
               hideLoad();
                if (response.redirect) {
                    if (response.isTrain){
                        jsonDictionary['isTrain'] = true
                        $("#Train").prop("disabled",false);
                    }
                    window.location = response.redirect;
                  }
                else{
                   var ct = xhr.getResponseHeader("content-type") || "";
                   if (ct.indexOf('html') > -1)
                       document.write(response);
                   else {
                        if('undefined'.localeCompare(response['error']) != 0){
                            optimize_message(response['error']);
                            $("#menu-multiple-descr-mode").addClass('disabled');
                            $("#menu-single-descr-mode").addClass('disabled');
                            $("#menu-analysis-train-link").addClass('disabled');
                            $('html, body').animate({scrollTop: 0}, 600);
                        }
                        //lock_mode(response['single_mod'], response['multiple_mod'])
                        //set_data(response['data'])
                        }
                    }
                }            
        })})



$('#reset_settings').click(function significanceTop() {
    $.ajax({
         type: "POST",
         url: '/resetSettings',
         beforeSend: setLoad(),
         data: get_data(),
         success: function(response, status, xhr){
            if (response.redirect) {
                    window.location.href = response.redirect;
            }
            else{
                var ct = xhr.getResponseHeader("content-type") || "";
                   if (ct.indexOf('html') > -1){
                        document.body.innerHTML = "";
                        document.write(response);
                   }
                   else {
                        if('undefined'.localeCompare(response['error']) != 0){
                            optimize_message(response['error']);
                            hideLoad();
                        }
                        else{
                            $('html, body').animate({scrollTop: 0}, 600);
                            hideLoad();
                        }
                    }
                }
         },
         error: function(error) {
                 document.getElementById('message').innerHTML = 'error of dynamic reset setting';
                 $('html, body').animate({scrollTop: 0}, 600);
                 $('#referring_to').select2({width:'100%'});
                 hideLoad();
             }
         })
        });


function checkValidation(){
    var inputs = document.getElementsByTagName('input');
    var fields = []
    for (index = 0; index < inputs.length; ++index) {
        fields.push(inputs[index])
    }
    var bool_fields = fields.map(function(field){return field.checkValidity()})
    return bool_fields.reduce(function(sum, current){return sum && current}, true)
}


function hideLoad(){
    $("#load").removeAttr("style").hide();
    $('#loadDiv').removeClass("disabledfilter");
}


function setLoad(){
    $("#load").show();
    $('#loadDiv').addClass('disabledfilter');
    }


function set_data(data){
    for(el in data){
        if(el == 'special_fields'){
            for (index = 0; index < data['special_fields'].length; ++index)
                special_fields.addRow(Object.assign({}, replaceForCategoric(data['special_fields'][index])))
            continue;
        }
        if(el == 'resolution'){
            // if one resolution and mas of values that
            if(Object.keys(data['resolution']).length == 1){
                $('#resolution1name').val(replaceForCategoric(Object.keys(data['resolution'])[0]))
                $('#resolution2name').val(replaceForCategoric(Object.keys(data['resolution'])[0]))
                $('#resolution1value').val(replaceForCategoric(data['resolution'][Object.keys(data['resolution'])[0]][0]))
                $('#resolution2value').val(replaceForCategoric(data['resolution'][Object.keys(data['resolution'])[0]][1]))
            }
            // if two resolution with one value
            else{
                var count = 1
                for(el in data['resolution']){
                    $('#resolution'+count+'name').val(replaceForCategoric(el))
                    $('#resolution'+count+'value').val(replaceForCategoric(data['resolution'][el]))
                    count = count + 1
                }
            }
            continue;
        }
        if(Array.isArray(data[el])){
            $("[id='"+el+"']").val(replaceForCategoric(data[el])).trigger('change')
            continue;
        }
        
        else
            $("[id='"+el+"']").val(replaceForCategoric(data[el]))
        
        }
    }
    

set_data(jsonDictionary['config_data'])


function replaceForCategoric(val){
    if(Array.isArray(val))
        return val.map(function(field){return replaceForCategoric(field)})
    // check that val is dictionary
    
    if(typeof val==='object' && val!==null && !(val instanceof Array) && !(val instanceof Date)){
        var row = val
        Object.keys(row).map(function(key, index) {
            key = replaceForCategoric(key)
            row[key] = replaceForCategoric(row[key])
            });
        return row
    }
    //use toString() for case when val not str
    return val.replace(new RegExp('&amp;', 'g'),'&').replace(new RegExp('&gt;', 'g'),'>').replace(new RegExp('&lt;', 'g'),'<').replace(new RegExp('&lt;=', 'g'),'<=').replace(new RegExp('&gt;=', 'g'),'>=').replace(new RegExp('&gt;=', 'g'),'>=').replace(new RegExp("&#39;", 'g'),"'");
}


function lock_mode(single_mad, multiple_mod){
    if(single_mad == true)
        $("#menu-single-descr-mode").removeClass('disabled');
    
    if(multiple_mod == true)
        $("#menu-multiple-descr-mode").removeClass('disabled');
}


if('undefined'.localeCompare(jsonDictionary['single_mod']) != 0 && 'undefined'.localeCompare(jsonDictionary['multiple_mod']) != 0){
    lock_mode(jsonDictionary['single_mod'], jsonDictionary['multiple_mod'])
    $("#menu-analysis-train-link").removeClass('disabled');
}

$('#area_of_testing_fields').find('[tabulator-field="gui_name"]:not(:first)').on("blur", function(){
    $(this).trigger("keydown", {
        keyCode: 27
    });
})