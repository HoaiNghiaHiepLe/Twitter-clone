export const paginationStage = ({
  page,
  limit
}: {
  page: number
  limit: number
}): [
  {
    $skip: number
  },
  {
    $limit: number
  }
] => [
  {
    // Trang hiện tại
    $skip: limit * (page - 1) // Công thưc phân trang
  },
  {
    // Số lượng bản ghi mỗi trang
    $limit: limit
  }
]
