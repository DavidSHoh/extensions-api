'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function() {
    // Use the jQuery document ready signal to know when everything has been initialized
    $(document).ready(function() {
        // Add your startup code here
        tableau.extensions.initializeAsync().then(function() {
            // When the user clicks the Configure... context menu item,
            // the configure function specified as the argument here
            // is executed.
            //
            //const dashboardName = tableau.extensions.dashboardContent.dashboard.name;
            //$('#choose_sheet_title').text(dashboardName);
            
            showModal();

            initializeButtons()
            //printBtn();

            //$('#modaltest').modal('toggle');

           });
        });

    function showModal(){
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        
        $('#choose_sheet_buttons').empty();

        worksheets.forEach(function(element){
            const button = $("<button type='button' class='btn btn-default btn-block'></button>");
            button.text(element.name);

            button.click(function() {
                // Get the worksheet name which was selected
                const worksheetName = element.name;

                // Close the dialog and show the data table for this worksheet
                $('#modaltest').modal('toggle');
                loadSelectedMarks(worksheetName);
            });

            $('#choose_sheet_buttons').append(button);
        });

        $('#modaltest').modal('toggle');
    }

    let unregisterEventHandlerFunction;

    function loadSelectedMarks(worksheetName){
        
        if (unregisterEventHandlerFunction) {
            unregisterEventHandlerFunction();
        }
        
        //alert(`Loading Data for ${worksheetName}`);
        //$('#modaltest').modal('toggle');

                const worksheet = getSelectedSheet(worksheetName);
        
        
                $(`#selected_marks_title`).text(worksheet.name)

        // Call to get the selected marks for our sheet
        worksheet.getSelectedMarksAsync().then(function(marks) {
            // Get the first DataTable for our selected marks (usually there is just one)
            const worksheetData = marks.data[0];

            // Map our data into the format which the data table component expects it
            const data = worksheetData.data.map(function(row, index) {
                const rowData = row.map(function(cell) {
                    return cell.formattedValue;
                });

                return rowData;
            });

            const columns = worksheetData.columns.map(function(column) {
                return {
                    title: column.fieldName
                };
            });

            // Populate the data table with the rows and columns we just pulled out
            populateDataTable(data, columns);
        });


        

        
        unregisterEventHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function (selectionEvent) {
        loadSelectedMarks(worksheetName);
        });
    }

    function initializeButtons() {
        $('#show_choose_sheet_button').click(showModal);
    }

    function populateDataTable(data, columns){
        // Do some UI setup here to change the visible section and reinitialize the table
        $('#data_table_wrapper').empty();

        if (data.length > 0) {
            $('#no_data_message').css('display', 'none');
            $('#data_table_wrapper').append(`<table id='data_table' class='table table-striped table-bordered'></table>`);

            // Do some math to compute the height we want the data table to be
            var top = $('#data_table_wrapper')[0].getBoundingClientRect().top;
            var height = $(document).height() - top - 130;

            // Initialize our data table with what we just gathered
            $('#data_table').DataTable({
                data: data,
                columns: columns,
                autoWidth: false,
                deferRender: true,
                scroller: true,
                scrollY: height,
                scrollX: true,
                dom: "<'row'<'col-sm-6'i><'col-sm-6'f>><'row'<'col-sm-12'tr>>" // Do some custom styling
            });
        } else {
            // If we didn't get any rows back, there must be no marks selected
            $('#no_data_message').css('display', 'inline');
        }
    }


    function getSelectedSheet(sheetName){
        return tableau.extensions.dashboardContent.dashboard.worksheets.find(function(sheet){
            return sheet.name === sheetName;
        });
    }
})();
