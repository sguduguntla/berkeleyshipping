function addItemToShelfRow(shelfRow, faClass) {
    let addedItem = false;

    for (let i = 0; i < shelfRow.length; i++) {
        const shelf = $(shelfRow[i]);

        if (shelf.children().length < 2) {
            shelf.append("<i class='" + faClass + "'></i>");
            addedItem = true;
            break;
        }
    }

    return addedItem;
}

$(document).ready(function () {

    const iconMap = {
        "Letters/Envelopes": "fas fa-2x fa-envelope",
        "Small Electronics": "fas fa-2x fa-mobile-alt",
        "Office/Stationery Supplies": "fas fa-2x fa-paperclip",
        "Wearables/Clothing": "fas fa-2x fa-tshirt",
        "Books": "fas fa-2x fa-book"
    };

    let addedIcons = [];
    let addedItems = [];

    $("#addItem").click(function (e) {

        e.preventDefault();

        $("#luggageFull").css("display", "none");

        if (addedIcons.length == Object.keys(iconMap).length + 1) {
            $("#luggageFull").text("YOUR LUGGAGE IS FULL!");
            $("#luggageFull").css("display", "block");
        } else {

            const item = $("#itemInput").val().trim();

            if (item != "") {
                const faClass = (item in iconMap ? iconMap[item] : "fas fa-2x fa-cubes");

                if (!addedIcons.includes(faClass)) {
                    let addedItem = addItemToShelfRow($(".shelf-row-1").children(), faClass);

                    if (!addedItem) {
                        addItemToShelfRow($(".shelf-row-2").children(), faClass);
                    }

                    addedIcons.push(faClass);
                    addedItems.push(item);

                } else {
                    $("#luggageFull").text("You've already added this item.");
                    $("#luggageFull").css("display", "block");
                }


            } else {
                $("#luggageFull").text("Please enter an item to add.");
                $("#luggageFull").css("display", "block");
            }

        }

    });

    $("#submitRequest").click(async function (event) {
        event.preventDefault();

        const formData = $("#locationForm").serializeArray();

        const data = {
            name: formData[0].value.trim(),
            email: formData[1].value.trim(),
            phone: formData[2].value.trim(),
            origin: formData[3].value.trim(),
            destination: formData[4].value.trim(),
            items: addedItems
        };

        if (data.name == "" || data.email == "" || data.origin == "" || data.destination == "" || data.items.length == 0) {
            $("#luggageFull").text("Please fill all required fields.");
            $("#luggageFull").css("display", "block");
        } else {

            $("#submitRequest").css("display", "none");
            $("#loader").css("display", "block");

            $.ajax({
                url: "https://sendit-api.herokuapp.com/requests",
                type: 'POST',
                data,
                success: function (data) {
                    Swal.fire({
                        title: '<strong>Success!</strong>',
                        type: 'success',
                        html: 'Your request has been sent!',
                        showCloseButton: true,
                        focusConfirm: false,
                        confirmButtonText: 'Great!'
                    });
                },
                error: function (xhr, status, error) {
                    $("#luggageFull").text("Something went wrong while sending. Try again.");
                    $("#luggageFull").css("display", "block");
                },
                complete: function() {
                    $("#submitRequest").css("display", "block");
                    $("#loader").css("display", "none");

                    $('#locationForm').trigger("reset");
                }
            });

        }

    });

    $(document).on('submit', '.mailingListForm', function (e) {
        e.preventDefault();

        Swal.fire({
            title: '<strong>Success!</strong>',
            type: 'success',
            html: 'You have been added to our mailing list. Look out for exciting news!',
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: 'Great!'
        });

        const formData = $(this).serializeArray();

        const email = formData[0].value;

        if (email != "") {
            $.ajax({
                url: "https://sendit-api.herokuapp.com/mailinglist",
                type: 'POST',
                data: {
                    email
                },
                success: function (data) {
                    if (data) {
                        Swal.fire({
                            title: '<strong>Success!</strong>',
                            type: 'success',
                            html: 'You have been added to our mailing list. Look out for exciting news!',
                            showCloseButton: true,
                            focusConfirm: false,
                            confirmButtonText: 'Great!'
                        });
                    }
                },
                error: function (xhr, status, error) {
                    Swal.fire({
                        title: '<strong>Oops!</strong>',
                        type: 'error',
                        html: ' Something went wrong. Please try again later.',
                        showCloseButton: true,
                        focusConfirm: false,
                        confirmButtonText: 'OK'
                    });
                },
                complete: function() {
                    $('.mailingListForm').trigger("reset");
                }
            });
        }
    });

    $(".deleteIcon").click(function (e) {
        if ($(this).parent().children().length > 1) {
            const deleteIcon = $(this);

            addedIcons = addedIcons.filter(function (value) {
                return value != $(deleteIcon.parent().children()[1]).attr('class');
            });

            $(this).parent().children()[1].remove();
            $("#luggageFull").css("display", "none");
        }
    });

    $("#itemInput").autocomplete({
        source: function (request, response) {
            response(Object.keys(iconMap));
        }
    });

    $("#itemInput").autocomplete("option", "delay", 100);

    $(".places").autocomplete({
        source: function (request, response) {
            $.getJSON(
                "http://gd.geobytes.com/AutoCompleteCity?callback=?&q=" + request.term,
                function (data) {
                    response(data);
                }
            );
        },
        minLength: 3
    });
    $(".places").autocomplete("option", "delay", 100);
});