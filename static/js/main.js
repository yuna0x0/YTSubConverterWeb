/**
 * Copyright (c) edisonlee55
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let hasExtension = (inputId, exts) => {
    var fileName = document.getElementById(inputId).files[0].name;
    return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$', 'i')).test(fileName);
};

document.getElementById("generate").addEventListener("click", () => {
    let file = document.getElementById("input").files[0];
    if (!file) {
        Swal.fire({
            icon: 'error',
            title: 'Please select the ASS file to be converted',
        });
        return;
    }
    if (!hasExtension('input', ['.ass'])) {
        Swal.fire({
            icon: 'error',
            title: 'Please select the file with ASS format',
        });
        return;
    }
    let fd = new FormData();
    fd.append('file', file);
    fetch('/upload', {
        method: 'POST',
        body: fd
    }).then(res => {
        if (res.ok) {
            return res.blob();
        } else {
            throw new Error(res.statusText);
        }
    }).then(blob => {
        let fileNameArr = document.getElementById('input').files[0].name.split('.');
        fileNameArr.pop();
        let fileName = fileNameArr.join('.') + ".ytt";
        let fileUrl = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileName;
        a.click();
    }).catch((e) => {
        Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            html: 'Please try again.<br><br>The file you uploaded might be corrupted or not yet supported by YTSubConverter.',
            footer: `${e}`
        });
    });
});
