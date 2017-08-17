function searchBook() {
    let keyword = document.getElementById('search').value;
    console.log(keyword);
    window.location.href = '/books?search=' + keyword;
}