/**
 * Copyright (c) edisonlee55
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

document.getElementById("generate").addEventListener("click", () => {
    let file = document.getElementById("input").files[0];
    if (!file) {
        Swal.fire({
            icon: 'error',
            title: 'Please select the ASS file to be converted',
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
            let fileName = res.headers.get('Content-Disposition').split('filename=')[1];
            if (fileName.charAt(0) === '"' && fileName.charAt(fileName.length - 1) === '"') {
                fileName = fileName.substr(1, fileName.length - 2);
            }
            return { blob: res.blob(), fileName: fileName };
        } else {
            throw new Error(res.statusText);
        }
    }).then(res => {
        res.blob.then((blob) => {
            let fileUrl = URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = fileUrl;
            a.download = res.fileName;
            a.click();
        });
    }).catch((e) => {
        Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            html: 'Please try again.<br><br>The file you uploaded might be corrupted or not yet supported by YTSubConverter.',
            footer: `${e}`
        });
    });
});
