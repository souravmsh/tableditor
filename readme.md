# TablEditor.js 

TablEditor.js is a jQuery-based library designed to provide inline editing functionality for HTML tables, with compatibility with Bootstrap styling. TablEditor.js enhances the experience of editing tabular data within web applications.

## Features:

- **Inline Editing**: Allows users to edit table cells directly within the HTML table, eliminating the need for separate forms or modal dialogs.
- **Compatibility**: Designed to seamlessly integrate with Bootstrap, ensuring consistency in styling and layout.
- **Pagination Support**: Supports pagination of data, enabling efficient navigation through large datasets.
- **Customization**: Provides options for customization of input elements, button styles, and pagination controls to fit the specific needs of the application.
- **Event Handling**: Allows developers to specify the event type (e.g., click) for triggering edit actions.
- **Ajax Integration**: Enables integration with server-side functionality through Ajax requests, facilitating data persistence and updates.
- **Error Handling**: Includes callbacks for handling success and failure scenarios, providing flexibility in error management.

## Demo [TablEditor.js](https://html-preview.github.io/?url=http://github.com/souravmsh/tableditor/blob/main/index.html)

## Usage:

1. **Include Dependencies**: Ensure jQuery and Bootstrap are included in the project.
2. **Include TablEditor.js**: Import TablEditor.js into your HTML file.
3. **Define HTML Table**: Create an HTML table with appropriate structure and classes for TablEditor.js to target.
4. **Initialize TablEditor**: Call `TablEditor()` on the target table, passing necessary configuration options.

## Configuration Options:

- **url**: URL for Ajax requests.
- **inputClass**: CSS class for input elements.
- **groupClass**: CSS class for button groups.
- **paginationClass**: CSS class for pagination controls.
- **deleteBtnClass**: CSS class for delete buttons.
- **editBtnClass**: CSS class for edit buttons.
- **refreshBtnClass**: CSS class for refresh buttons.
- **paginationLink**: Selector for pagination links.
- **eventType**: Event type for triggering edit actions.
- **columns**: Configuration for editable columns, including identifier and editable fields.
- **onAjax**: Callback function for handling Ajax requests.
- **onFail**: Callback function for handling Ajax failures.
- **onSuccess**: Callback function for handling successful Ajax responses.

## Example:

```HTML
<div class="text-center p-5">
    <button type="button" class="tableditor-btn-refresh btn btn-primary">Refresh Page</button>
    <button type="button" disabled="" class="tableditor-btn-edit btn btn-info">Update 0 Items</button>
    <button type="button" disabled="" class="tableditor-btn-delete btn btn-danger">Delete 0 Items</button>
</div>

<table class="tableditor table table-nowrap align-middle">
    <thead>
        <tr>
            <th></th>
            <th>Status</th>
            <th>Product Code</th>
            <th>Name</th>
            <th>Category</th>
            <th>Order ID</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Value</th> 
        </tr>
    </thead>
    <tbody>
        <tr data-id="1">
            <td></td>
            <td><span class="badge bg-info">Processing</span></td>
            <td>XZ01001</td>
            <td>ABC</td>
            <td>A</td>
            <td>10001</td>
            <td class="qty">10</td>
            <td class="price">10</td>
            <td class="value">100</td>
        </tr> 
        <tr data-id="2">
            <td></td>
            <td><span class="badge bg-warning">Pending</span></td>
            <td>XZ01002</td>
            <td>XYZ</td>
            <td>B</td>
            <td>10002</td>
            <td class="qty">5</td>
            <td class="price">15</td>
            <td class="value">75</td>
        </tr> 
    </tbody>
</table>

<div class="d-flex justify-content-end">
    <nav>
        <ul class="pagination">
            <li class="page-item disabled" aria-disabled="true" aria-label="« Previous">
                <span class="page-link" aria-hidden="true">‹</span>
            </li>
            <li class="page-item active" aria-current="page"><span class="page-link">1</span></li>
            <li class="page-item">
                <a class="page-link" href="index.html?page=2">2</a>
            </li>
            <li class="page-item">
                <a class="page-link" href="index.html?page=2" rel="next" aria-label="Next »">›</a>
            </li>
        </ul>
    </nav>
</div> 

```

```javascript
$('.tableditor').TablEditor({
    url: window.location.href,
    inputClass: "form-control input-sm",
    groupClass: "btn-group btn-group-sm",
    paginationClass: "page-link",
    deleteBtnClass: "tableditor-btn-delete",
    editBtnClass: "tableditor-btn-edit",
    refreshBtnClass: "tableditor-btn-refresh",
    paginationLink: "a.page-link",
    eventType: "click",
    columns: {
        identifier: [0, 'id'],
        editable: [
            [2, 'product_code', '{"XZ01001":"XZ01001","XZ01002":"XZ01002","XZ01003":"XZ01003","XZ01004":"XZ01004","XZ01005":"XZ01005"}'],
            [3, 'name', '{"ABC":"ABC","DEF":"DEF","MNO":"MNO","XYZ":"XYZ"}'],
            [4, 'category', '{"A":"A","B":"B","Z":"Z"}'],
            [5, 'order_id'],
            [6, 'quantity'],
            [7, 'price'],
        ]
    },
    onAjax: function(action, data) { return; },
    onFail: function(jqXHR, textStatus, errorThrown) {
        console.log('onFail(jqXHR, textStatus, errorThrown)');
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    },
    onSuccess: function(data, textStatus, jqXHR) {
        console.log('onSuccess(data, textStatus, jqXHR)');
        console.log(data);
        console.log(textStatus);
        console.log(jqXHR);
    }
}); 

